import { uploadService } from './uploadService';

/**
 * Custom Cloudinary Upload Task to integrate smoothly with our progress monitoring UI.
 */
export interface CloudinaryUploadTask {
  cancel: () => void;
  promise: Promise<string>;
}

/**
 * Gets Cloudinary environment variables.
 */
export function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  return { cloudName, uploadPreset };
}

/**
 * Determines file category for logs or specific Cloudinary pathing (if needed),
 * though direct auto-upload path '/auto/upload' is used for safety.
 */
export function getResourceType(file: File | Blob | string, fileName?: string): string {
  let name = fileName || '';
  if (file instanceof File) {
    name = file.name;
  }
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'heic'].includes(ext)) {
    return 'image';
  }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv', '3gp'].includes(ext)) {
    return 'video';
  }
  if (file instanceof File || file instanceof Blob) {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
  }
  return 'raw'; // Default fallback for files like PDFs
}

/**
 * Performs a direct client-side upload to Cloudinary with real-time transfer state tracking.
 */
export function uploadToCloudinary(
  fileOrBlobOrBase64: File | Blob | string,
  fileName: string = 'file',
  blockId: string | null = null,
  onProgress?: (progress: number) => void
): CloudinaryUploadTask {
  const { cloudName, uploadPreset } = getCloudinaryConfig();

  // Guard: if Cloudinary config is missing or unconfigured, reject immediately with a clean, descriptive message
  const isPresetConfigured = uploadPreset && uploadPreset !== 'your_preset_here' && uploadPreset !== '';
  if (!cloudName || !isPresetConfigured) {
    const errorMsg = !cloudName 
      ? 'Cloudinary Cloud Name is not configured. Please define VITE_CLOUDINARY_CLOUD_NAME in your environment.'
      : 'Cloudinary Upload Preset is missing or set to a placeholder. Set VITE_CLOUDINARY_UPLOAD_PRESET with an Unsigned Upload Preset in your environment to enable uploads.';
    
    console.error(`[CloudinaryService] ${errorMsg}`);
    
    // Notify upload service about the failure so that progress bars stop loading and display the error
    uploadService.failUpload(errorMsg);
    
    return {
      cancel: () => {},
      promise: Promise.reject(new Error(errorMsg))
    };
  }

  const xhr = new XMLHttpRequest();
  const startTime = Date.now();

  const promise = new Promise<string>((resolve, reject) => {
    // Determine Resource Type for the upload endpoint to avoid mismatching assets (e.g. video vs image)
    const resourceType = getResourceType(fileOrBlobOrBase64, fileName);
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    xhr.open('POST', uploadUrl, true);

    // Track Real-time Progress & Speed Coordinates
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progressRaw = (event.loaded / event.total) * 100;
        const progressRounded = Math.round(progressRaw);
        
        if (onProgress) {
          onProgress(progressRounded);
        }

        const elapsedMs = Date.now() - startTime;
        let speed: number | null = null;
        let eta: number | null = null;

        if (elapsedMs > 500 && event.loaded > 0) {
          const speedBytesPerSec = event.loaded / (elapsedMs / 1000);
          speed = Math.round(speedBytesPerSec / 1024); // KB/s
          const remainingBytes = event.total - event.loaded;
          eta = speedBytesPerSec > 0 ? Math.ceil(remainingBytes / speedBytesPerSec) : 0;
        }

        // Broadcast current measurements to centralized progress bars
        uploadService.updateStatus({
          progress: progressRounded,
          speed,
          eta,
        });
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            console.log(`%c[Cloudinary] Successful direct upload! URL: ${response.secure_url}`, 'color: #10b981; font-weight: bold;');
            uploadService.completeUpload();
            resolve(response.secure_url);
          } else {
            const err = new Error('Cloudinary response did not return secure_url');
            uploadService.failUpload(err.message);
            reject(err);
          }
        } catch (parseError: any) {
          uploadService.failUpload('Failed to parse Cloudinary response format');
          reject(parseError);
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          const errorMsg = response.error?.message || `Upload failed with HTTP status ${xhr.status}`;
          uploadService.failUpload(errorMsg);
          reject(new Error(errorMsg));
        } catch {
          const errorMsg = `Upload failed with HTTP status ${xhr.status}`;
          uploadService.failUpload(errorMsg);
          reject(new Error(errorMsg));
        }
      }
    };

    xhr.onerror = () => {
      const errorMsg = 'Network error occurred during Cloudinary transfer.';
      uploadService.failUpload(errorMsg);
      reject(new Error(errorMsg));
    };

    xhr.onabort = () => {
      const errorMsg = 'Upload cancelled by user.';
      uploadService.failUpload(errorMsg);
      reject(new Error(errorMsg));
    };

    // Prepare Payload
    const formData = new FormData();
    formData.append('file', fileOrBlobOrBase64);
    formData.append('upload_preset', uploadPreset);
    formData.append('filename_override', fileName);

    // Begin Transfer
    xhr.send(formData);
  });

  return {
    cancel: () => {
      console.log('[Cloudinary] Aborting ongoing HTTP upload request...');
      xhr.abort();
    },
    promise
  };
}
