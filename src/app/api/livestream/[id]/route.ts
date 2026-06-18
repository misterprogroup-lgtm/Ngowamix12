import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getLivestreamById, updateLivestreamStatus } from '@/lib/livestream';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stream = await getLivestreamById(id);
    if (!stream) return NextResponse.json({ error: 'Live introuvable' }, { status: 404 });
    return NextResponse.json({ stream });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const stream = await db.liveStream.findUnique({ where: { id }, include: { artist: true } });
    if (!stream) return NextResponse.json({ error: 'Live introuvable' }, { status: 404 });
    if (stream.artist.userId !== user.sub && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { status, title, description, thumbnail, streamUrl } = body;

    if (status && ['LIVE', 'ENDED', 'SCHEDULED'].includes(status)) {
      await updateLivestreamStatus(id, status);
    }

    const updated = await db.liveStream.update({
      where: { id },
      data: { title, description, thumbnail, streamUrl },
    });

    return NextResponse.json({ stream: updated });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const stream = await db.liveStream.findUnique({ where: { id }, include: { artist: true } });
    if (!stream) return NextResponse.json({ error: 'Live introuvable' }, { status: 404 });
    if (stream.artist.userId !== user.sub && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await db.liveStream.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
