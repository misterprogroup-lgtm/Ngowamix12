import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  coverImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),

  artistAvatar: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),

  audioTrack: f({ audio: { maxFileSize: '64MB', maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => ({ url: file.url })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
