import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { uploadFile } from '@/lib/upload';

export async function POST(req: Request) {
  try {
    await requireRole(['ADMIN']);

    const formData = await req.formData();
    const albumId = formData.get('albumId') as string;
    const file = formData.get('image') as File;

    if (!albumId || !file) {
      return NextResponse.json({ error: 'albumId et image requis' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const result = await uploadFile(buffer, filename, 'covers');

    await db.album.update({
      where: { id: albumId },
      data: { coverImage: result.url },
    });

    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Album cover upload error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}
