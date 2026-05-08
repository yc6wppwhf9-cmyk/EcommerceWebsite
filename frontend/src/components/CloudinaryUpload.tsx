import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  onBulkChange?: (urls: string[]) => void;
  label?: string;
  multiple?: boolean;
}

export const CloudinaryUpload = ({ value, onChange, onBulkChange, label = 'Product Image', multiple = false }: CloudinaryUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    setError('');
    setProgress({ current: 0, total: fileArray.length });

    try {
      const uploadPromises = fileArray.map(async (file, idx) => {
        if (!file.type.startsWith('image/')) return null;
        
        // Auto-compress and resize image before upload
        const compressedFile = await compressImage(file);
        
        const form = new FormData();
        form.append('file', compressedFile, 'image.webp');
        form.append('upload_preset', uploadPreset);
        form.append('folder', 'priority-bags/products');

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: form }
        );
        const data = await res.json();
        
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
        return data.secure_url;
      });

      const urls = (await Promise.all(uploadPromises)).filter(u => u !== null) as string[];

      if (urls.length > 0) {
        if (multiple && onBulkChange) {
          onBulkChange(urls);
        } else {
          onChange(urls[0]);
        }
      } else {
        setError('Upload failed — check Cloudinary env vars');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed — check your internet connection');
    } finally {
      setUploading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleFile = async (file: File) => {
    // Legacy support for single file
    const list = new DataTransfer();
    list.items.add(file);
    handleFiles(list.files);
  };

  // Helper function to compress image using Canvas
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max resolution 2000px (standard for web products)
          const MAX_SIZE = 2000;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Export as WebP with 0.8 quality (very efficient size/quality balance)
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Compression failed'));
            },
            'image/webp',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFiles(files);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase text-priority-blue tracking-widest">{label}</label>

      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
          uploading ? 'border-priority-blue/50 bg-priority-blue/5' :
          value ? 'border-priority-blue/30 bg-gray-50' :
          'border-gray-200 hover:border-priority-blue/50 bg-[var(--color-bg-main)]'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {value && !uploading ? (
          /* Preview */
          <div className="relative group p-2">
            <img
              src={value}
              alt="Uploaded product"
              className="w-full h-44 object-contain rounded-xl bg-white"
            />
            {/* Hover actions */}
            <div className="absolute inset-2 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-gray-800 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg hover:bg-priority-blue hover:text-white transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Upload area */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full py-10 flex flex-col items-center gap-3 text-gray-400 hover:text-priority-blue transition-colors disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 size={32} className="animate-spin text-priority-blue" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Upload size={24} />
              </div>
            )}
            <div className="text-center space-y-1">
              <p className="text-[11px] font-black uppercase tracking-widest">
                {uploading ? `Uploading ${progress.current} of ${progress.total}...` : multiple ? 'Click to Bulk Upload (Ctrl+A)' : 'Click or drag & drop'}
              </p>
              <p className="text-[10px] text-gray-300 font-medium">PNG · JPG · WEBP · Max 50MB</p>
            </div>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
};
