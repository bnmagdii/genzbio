import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, CloudLightning, Info } from 'lucide-react';
import { uploadService, UploadStatus } from '../lib/uploadService';

interface UploadProgressBarProps {
  blockId?: string | null; // If provided, only shows inline when the upload matches this blockId
  className?: string;
  isInline?: boolean; // Changes layout styling for inline versus hovering overlay cards
}

export const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  blockId = null,
  className = '',
  isInline = false,
}) => {
  const [status, setStatus] = useState<UploadStatus>(uploadService.getStatus());

  useEffect(() => {
    // Subscribe to real-time updates from our upload service
    const unsubscribe = uploadService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, []);

  // If there is no active upload, do not render anything
  if (!status.isUploading) {
    return null;
  }

  // If this component was constrained to a blockId, verify if the blockId matches
  if (blockId && status.blockId !== blockId) {
    return null;
  }

  const progress = status.progress ?? 0;
  const roundedProgress = Math.round(progress);

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    uploadService.cancelActiveUpload();
  };

  if (isInline) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`w-full bg-[#0a0f1d] border border-purple-500/20 rounded-2xl p-4 mt-3 space-y-3 shadow-md ${className}`}
      >
        <div className="flex justify-between items-center bg-purple-950/20 px-3 py-1.5 rounded-xl border border-purple-500/10">
          <div className="flex items-center gap-2 min-w-0">
            <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" />
            <span className="text-[10px] text-zinc-300 font-extrabold uppercase tracking-wider truncate">
              {status.fileName || 'Processing active file payload...'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/40 text-red-300 text-[9px] font-black uppercase tracking-widest py-1 px-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-400">
            <span>Uploading Progress</span>
            <span className="text-purple-400 font-black">{roundedProgress}%</span>
          </div>
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]"
            />
          </div>
        </div>

        {(status.speed !== null || status.eta !== null) && (
          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 bg-white/[0.01] px-2 py-1 rounded-lg border border-white/[0.02]">
            {status.speed !== null && (
              <span className="flex items-center gap-1 leading-none">
                <CloudLightning className="w-2.5 h-2.5 text-zinc-650" /> Speed: {status.speed} KB/s
              </span>
            )}
            {status.eta !== null && (
              <span className="flex items-center gap-1 leading-none">
                <Info className="w-2.5 h-2.5 text-zinc-650" /> ETA: {status.eta}s remaining
              </span>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Hovering Card layout for bottom-right global indications
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className={`fixed bottom-5 right-5 z-50 p-5 bg-[#090d16] border border-purple-500/30 rounded-3xl w-80 shadow-2xl backdrop-blur-md space-y-4 text-left ${className}`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Real-time Transfer</span>
            <span className="text-xs text-white font-bold truncate block">{status.fileName || 'Uploading item...'}</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 px-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg hover:text-red-300 transition-colors cursor-pointer text-[10px] flex items-center gap-1 hover:scale-105 active:scale-95"
            title="Cancel upload"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-400 font-medium font-mono">Progress percentage</span>
            <span className="text-purple-400 font-black font-mono text-xs">{roundedProgress}%</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.15 }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
            />
          </div>
        </div>

        {(status.speed !== null || status.eta !== null) && (
          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 pt-2 border-t border-white/5">
            {status.speed !== null && (
              <span>Speed: {status.speed} KB/s</span>
            )}
            {status.eta !== null && (
              <span>ETA: {status.eta} seconds</span>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
