import fs from 'fs';
import path from 'path';

interface UploadResult {
  url: string;
  pathname: string;
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: 'covers' | 'avatars' | 'audio'
): Promise<UploadResult> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`uploads/${folder}/${filename}`, buffer, {
      access: 'public',
    });
    return { url: blob.url, pathname: blob.pathname };
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

export const coverUpload = uploadFile;

export function getLocalUploadPath(folder: 'covers' | 'avatars' | 'audio'): string {
  return path.join(process.cwd(), 'public', 'uploads', folder);
}
