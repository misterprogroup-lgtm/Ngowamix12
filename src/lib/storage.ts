import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  client = new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: process.env.S3_ENDPOINT ? true : undefined,
  });
  return client;
}

function getBucket(): string {
  return process.env.S3_BUCKET || 'ngowamix';
}

function getPublicUrl(key: string): string {
  const customDomain = process.env.S3_PUBLIC_URL;
  if (customDomain) {
    const base = customDomain.replace(/\/+$/, '');
    return `${base}/${key}`;
  }
  const endpoint = process.env.S3_ENDPOINT || '';
  if (endpoint) {
    const base = endpoint.replace(/\/+$/, '');
    return `${base}/${getBucket()}/${key}`;
  }
  return `/uploads/${key}`;
}

export function isS3Configured(): boolean {
  return !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
}

export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const s3 = getClient();
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    },
  });
  await upload.done();
  return getPublicUrl(key);
}

export async function deleteFromS3(key: string): Promise<void> {
  const s3 = getClient();
  await s3.send(new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  }));
}

export async function deleteFolderFromS3(prefix: string): Promise<void> {
  const s3 = getClient();
  const listed = await s3.send(new ListObjectsV2Command({
    Bucket: getBucket(),
    Prefix: prefix,
  }));
  if (!listed.Contents?.length) return;
  await Promise.all(
    listed.Contents.map((obj) =>
      s3.send(new DeleteObjectCommand({
        Bucket: getBucket(),
        Key: obj.Key!,
      })),
    ),
  );
}

export function isVercelBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function uploadToVercelBlob(
  buffer: Buffer,
  filename: string,
): Promise<{ url: string; pathname: string }> {
  const { put } = await import('@vercel/blob');
  const blob = await put(filename, buffer, { access: 'public' });
  return { url: blob.url, pathname: blob.url };
}

export async function deleteFromVercelBlob(url: string): Promise<void> {
  const { del } = await import('@vercel/blob');
  await del(url);
}

export function isVercelBlobUrl(url: string): boolean {
  return url.includes('public.blob.vercel-storage.com');
}
