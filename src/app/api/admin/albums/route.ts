import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    const albums = await db.album.findMany({
      include: {
        artist: { select: { name: true, slug: true } },
        _count: { select: { tracks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Admin albums error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
