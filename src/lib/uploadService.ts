export interface CancelableTask {
  cancel: () => void;
}

export interface UploadStatus {
  progress: number | null;
  speed: number | null;
  eta: number | null;
  error: string | null;
  isUploading: boolean;
  fileName: string | null;
  blockId: string | null;
}

class UploadService {
  private activeTask: CancelableTask | null = null;
  private cancelCallback: (() => void) | null = null;
  private listeners: Set<(status: UploadStatus) => void> = new Set();

  private status: UploadStatus = {
    progress: null,
    speed: null,
    eta: null,
    error: null,
    isUploading: false,
    fileName: null,
    blockId: null,
  };

  /**
   * Return a snapshot of the current state
   */
  getStatus(): UploadStatus {
    return { ...this.status };
  }

  /**
   * Update internal status and broadcast to subscribers
   */
  updateStatus(newStatus: Partial<UploadStatus>) {
    this.status = { ...this.status, ...newStatus };
    this.notify();
  }

  /**
   * Starts a monitored upload session
   */
  startUpload(task: CancelableTask | null, blockId: string | null, fileName: string, onCancel?: () => void) {
    this.activeTask = task;
    this.cancelCallback = onCancel || null;
    this.status = {
      progress: 0,
      speed: null,
      eta: null,
      error: null,
      isUploading: true,
      fileName,
      blockId,
    };
    this.notify();
  }

  /**
   * Registers successful upload state completion
   */
  completeUpload() {
    this.activeTask = null;
    this.cancelCallback = null;
    this.status = {
      progress: null,
      speed: null,
      eta: null,
      error: null,
      isUploading: false,
      fileName: null,
      blockId: null,
    };
    this.notify();
  }

  /**
   * Registers a failed upload state
   */
  failUpload(error: string) {
    this.activeTask = null;
    this.cancelCallback = null;
    this.status = {
      ...this.status,
      error,
      isUploading: false,
      progress: null,
    };
    this.notify();
  }

  /**
   * Cancels the active upload task and cleans up the state
   */
  cancelActiveUpload() {
    console.log('[UploadService] Cancelling active upload...');
    if (this.activeTask) {
      try {
        this.activeTask.cancel();
      } catch (err) {
        console.error('[UploadService] Error cancelling Firebase task:', err);
      }
      this.activeTask = null;
    }
    if (this.cancelCallback) {
      try {
        this.cancelCallback();
      } catch (err) {
        console.error('[UploadService] Error invoking cancel callback:', err);
      }
      this.cancelCallback = null;
    }
    this.status = {
      progress: null,
      speed: null,
      eta: null,
      error: 'Upload cancelled by user',
      isUploading: false,
      fileName: null,
      blockId: null,
    };
    this.notify();
  }

  /**
   * Subscribe to state modifications
   */
  subscribe(listener: (status: UploadStatus) => void): () => void {
    this.listeners.add(listener);
    // Emit initial status
    listener({ ...this.status });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const statusCopy = { ...this.status };
    this.listeners.forEach((l) => l(statusCopy));
  }
}

export const uploadService = new UploadService();
