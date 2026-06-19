/**
 * ImageProcessor Utility
 * Resizes and compresses images, converting them to optimized WebP format
 * while preserving GIF animations or non-image assets safely.
 */

export interface ImageProcessingOptions {
  maxDimension?: number;
  quality?: number;
  maxSizeBytes?: number;
}

export const ImageProcessor = {
  /**
   * Processes an image file by resizing it and converting to a WebP blob/file.
   * GIFs are bypassed to maintain animation loops.
   */
  processImage: (
    file: File,
    options: ImageProcessingOptions = {}
  ): Promise<File | Blob> => {
    const {
      maxDimension = 1600,
      quality = 0.82,
      maxSizeBytes = 5 * 1024 * 1024 // 5MB standard limit
    } = options;

    return new Promise((resolve, reject) => {
      // 1. Strict Size Check
      if (file.size > maxSizeBytes) {
        reject(new Error(`File is too large (max limit is ${maxSizeBytes / (1024 * 1024)} MB).`));
        return;
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      // If it's a GIF, bypass conversion to preserve multi-frame animations
      if (extension === 'gif' || file.type === 'image/gif') {
        resolve(file);
        return;
      }

      // Check if file is an image type
      if (!file.type.startsWith('image/')) {
        resolve(file); // Return as is for other asset types (like PDFs/videos)
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // 2. Proportional Scaling
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0, width, height);

          // 3. WebP Conversion & Quality Adjustment
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const processedFile = new File([blob], `${nameWithoutExt}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(processedFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Generates a small webp thumbnail using Canvas.
   */
  generateThumbnail: (
    file: File,
    maxDim: number = 200,
    quality: number = 0.70
  ): Promise<File | Blob> => {
    return new Promise((resolve) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (extension === 'gif' || file.type === 'image/gif') {
        resolve(file);
        return;
      }

      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                const processedFile = new File([blob], `${nameWithoutExt}_thumb.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(processedFile);
              } else {
                resolve(file);
              }
            },
            'image/webp',
            quality
          );
        };
        img.onerror = () => resolve(file);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  }
};
