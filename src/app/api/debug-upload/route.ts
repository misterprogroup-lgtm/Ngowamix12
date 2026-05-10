import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    UPLOADTHING_TOKEN: !!process.env.UPLOADTHING_TOKEN,
    UPLOADTHING_APP_ID: !!process.env.UPLOADTHING_APP_ID,
    VERCEL: !!process.env.VERCEL,
  };

  let uploadTest = null;
  if (process.env.UPLOADTHING_TOKEN) {
    try {
      const { UTApi } = await import('uploadthing/server');
      const utapi = new UTApi();
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await utapi.uploadFiles(testFile);
      if (result.data) {
        await utapi.deleteFiles([result.data.key]);
        uploadTest = 'OK';
      } else {
        uploadTest = `FAIL: ${result.error?.message}`;
      }
    } catch (err: any) {
      uploadTest = `ERROR: ${err?.message ?? err}`;
    }
  } else {
    uploadTest = 'SKIP (no secret)';
  }

  return NextResponse.json({ envStatus, uploadTest });
}
