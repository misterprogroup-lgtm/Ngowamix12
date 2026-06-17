import { utapi } from './uploadthing';
import { isS3Configured, uploadToS3, isVercelBlobConfigured, uploadToVercelBlob } from './storage';
import fs from 'fs';
import path from 'path';

interface UploadResult {
  url: string;
  pathname: string;
}

const MIME_TYPES: Record<string, string> = {
  covers: 'image/webp',
  avatars: 'image/webp',
  audio: 'audio/mpeg',
  posters: 'image/webp',
};

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: 'covers' | 'avatars' | 'audio' | 'posters',
): Promise<UploadResult> {
  if (isVercelBlobConfigured()) {
    try {
      return await uploadToVercelBlob(buffer, `${folder}/${filename}`);
    } catch (err) {
      console.error('Vercel Blob upload failed:', err);
    }
  }

  if (isS3Configured()) {
    try {
      const key = `${folder}/${filename}`;
      const contentType = MIME_TYPES[folder] || 'application/octet-stream';
      const url = await uploadToS3(buffer, key, contentType);
      return { url, pathname: key };
    } catch (err) {
      console.error('S3 upload failed:', err);
    }
  }

  if (process.env.UPLOADTHING_TOKEN) {
    try {
      const file = new File([new Uint8Array(buffer)], filename);
      const { data, error } = await utapi.uploadFiles(file);
      if (error || !data) throw new Error(error?.message ?? 'Upload failed');
      return { url: data.url, pathname: data.key };
    } catch (err) {
      console.error('Uploadthing upload failed:', err);
    }
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return {
    url: `/uploads/${folder}/${filename}`,
    pathname: `/uploads/${folder}/${filename}`,
  };
}

export function getLocalUploadPath(folder: 'covers' | 'avatars' | 'audio' | 'posters'): string {
  return path.join(process.cwd(), 'public', 'uploads', folder);
}

export function isS3Url(url: string): boolean {
  return url.startsWith('http') && !url.startsWith('/') && !url.includes('public.blob.vercel-storage.com');
}

export function isUploadThingUrl(url: string): boolean {
  return url.includes('utfs.io') || url.includes('uploadthing.com');
}

export function isVercelBlobUrl(url: string): boolean {
  return url.includes('public.blob.vercel-storage.com');
}

export function getKeyFromUrl(url: string): string | null {
  if (isUploadThingUrl(url)) return url;
  if (isVercelBlobUrl(url)) return url;
  if (isS3Url(url)) {
    const parts = url.split('/');
    const idx = parts.findIndex((p) => p === getBucketFromEnv());
    if (idx >= 0) return parts.slice(idx + 1).join('/');
    return null;
  }
  if (url.startsWith('/uploads/')) {
    return url.replace(/^\/uploads\//, '');
  }
  return null;
}

function getBucketFromEnv(): string {
  return process.env.S3_BUCKET || 'ngowamix';
}
