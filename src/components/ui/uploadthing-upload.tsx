'use client';

import { generateUploadDropzone } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

const Dropzone = generateUploadDropzone<OurFileRouter>();

interface UploadthingUploadProps {
  endpoint: keyof OurFileRouter;
  onUploadComplete: (url: string) => void;
}

export function UploadthingUpload({
  endpoint,
  onUploadComplete,
}: UploadthingUploadProps) {
  return (
    <Dropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res?.[0]) onUploadComplete(res[0].url);
      }}
      onUploadError={(err) => {
        alert(`Erreur: ${err.message}`);
      }}
    />
  );
}
