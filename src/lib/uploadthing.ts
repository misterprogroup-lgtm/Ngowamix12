import { UTApi } from 'uploadthing/server';

export const utapi = new UTApi();

export async function deleteUploadedFiles(keys: string[]) {
  try {
    await utapi.deleteFiles(keys);
  } catch (err) {
    console.error('Uploadthing delete failed:', err);
  }
}
