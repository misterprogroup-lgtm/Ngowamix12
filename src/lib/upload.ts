import { utapi } from './uploadthing';
import fs from 'fs';
import path from 'path';

interface UploadResult {
  url: string;
  pathname: string;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  _folder: 'covers' | 'avatars' | 'audio'
): Promise<UploadResult> {
  if (process.env.UPLOADTHING_SECRET) {
    try {
      const file = new File([new Uint8Array(buffer)], filename);
      const { data, error } = await utapi.uploadFiles(file);
      if (error || !data) throw new Error(error?.message ?? 'Upload failed');
      return { url: data.url, pathname: data.key };
    } catch (err) {
      console.error('Uploadthing upload failed:', err);
    }
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', _folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return {
    url: `/uploads/${_folder}/${filename}`,
    pathname: `/uploads/${_folder}/${filename}`,
  };
}

export const coverUpload = uploadFile;

export function getLocalUploadPath(folder: 'covers' | 'avatars' | 'audio'): string {
  return path.join(process.cwd(), 'public', 'uploads', folder);
}
