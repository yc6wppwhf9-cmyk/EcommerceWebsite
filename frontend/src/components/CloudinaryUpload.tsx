import { useState, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const CloudinaryUpload = ({ value, onChange, label = 'Product Image' }: CloudinaryUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large — max 10MB');
      return;
    }

    setUploading(true);
    setError('');

    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', uploadPreset);
    form.append('folder', 'priority-bags/products');

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: form }
      );
      const data = await res.json();

      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        setError('Upload failed — check Cloudinary env vars');
      }
    } catch {
      setError('Upload failed — check your internet connection');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
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
        {value ? (
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
                {uploading ? 'Uploading to Cloudinary…' : 'Click or drag & drop'}
              </p>
              <p className="text-[10px] text-gray-300 font-medium">PNG · JPG · WEBP · Max 10MB</p>
            </div>
          </button>
        )}
      </div>

      {/* URL fallback input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300">or paste URL</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full pl-8 pr-4 py-2.5 bg-[var(--color-bg-main)] border border-[var(--color-border-main)] rounded-xl text-[11px] font-medium text-[var(--color-text-main)] focus:border-priority-blue outline-none transition-all"
          />
        </div>
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
};
