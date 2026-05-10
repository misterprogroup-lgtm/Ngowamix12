'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { generateReactHelpers } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface DirectUploadProps {
  endpoint: keyof OurFileRouter;
  onUploadComplete: (url: string) => void;
  accept?: string;
  label?: string;
}

export function DirectUpload({
  endpoint,
  onUploadComplete,
  accept = '*/*',
  label = 'Choisir un fichier',
}: DirectUploadProps) {
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing(endpoint as any, {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        setUploadedUrl(res[0].url);
        onUploadComplete(res[0].url);
      }
    },
    onUploadProgress: (pct) => {
      setUploadProgress(pct);
    },
    onUploadError: (err) => {
      setError(err.message || 'Erreur upload');
    },
  });

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setUploadProgress(0);
    await startUpload([file]);
  }, [startUpload]);

  if (uploadedUrl) {
    return (
      <div className="w-full rounded-lg border border-border p-4 text-center">
        <p className="text-sm text-success font-medium">✓ Fichier uploadé</p>
        <button
          type="button"
          className="text-xs text-error hover:underline mt-1"
          onClick={() => setUploadedUrl('')}
        >
          Supprimer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div
        className="relative border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {isUploading ? (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-primary mx-auto animate-bounce" />
            <p className="text-sm text-text-secondary">Upload en cours...</p>
            <div className="w-full bg-surface-hover rounded-full h-2 max-w-xs mx-auto">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">{Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-text-muted mx-auto" />
            <p className="text-sm text-text-secondary">{label}</p>
            {error && <p className="text-xs text-error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
