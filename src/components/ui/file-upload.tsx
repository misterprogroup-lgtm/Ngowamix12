import { forwardRef, useState } from 'react';
import { Upload, X, FileAudio, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  accept: string;
  maxSizeMB?: number;
  value?: string;
  onChange: (file: File | null) => void;
  preview?: boolean;
  className?: string;
  error?: string;
}

export function FileUpload({
  label,
  accept,
  maxSizeMB = 10,
  value,
  onChange,
  preview = true,
  className,
  error,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);

  const isAudio = accept.includes('audio');

  const handleFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Fichier trop volumineux. Maximum: ${maxSizeMB}MB`);
      return;
    }
    onChange(file);
    if (preview) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    onChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          error && 'border-error'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {previewUrl ? (
          <div className="space-y-2">
            {isAudio ? (
              <FileAudio className="h-8 w-8 text-primary mx-auto" />
            ) : (
              <img src={previewUrl} alt="Preview" className="h-24 w-24 rounded-lg mx-auto object-cover" />
            )}
            <p className="text-sm text-text-primary font-medium">
              Fichier sélectionné
            </p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="text-xs text-error hover:underline"
            >
              Supprimer
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {isAudio ? (
              <FileAudio className="h-8 w-8 text-text-muted mx-auto" />
            ) : (
              <ImageIcon className="h-8 w-8 text-text-muted mx-auto" />
            )}
            <Upload className="h-5 w-5 text-primary mx-auto" />
            <p className="text-sm text-text-secondary">
              Glissez un fichier ou <span className="text-primary">parcourir</span>
            </p>
            <p className="text-xs text-text-muted">
              {accept.split(',').join(', ')} — Max {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
