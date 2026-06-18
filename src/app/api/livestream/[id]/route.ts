import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getLivestreamById, updateLivestreamStatus } from '@/lib/livestream';
import { getMuxLiveStream, deleteMuxLiveStream, signalMuxLiveStreamComplete, parseMuxData } from '@/lib/mux';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const stream = await getLivestreamById(id);
    if (!stream) return NextResponse.json({ error: 'Live introuvable' }, { status: 404 });

    const muxData = stream.streamKey ? parseMuxData(stream.streamKey) : null;
    let muxStatus = null;
    if (muxData?.muxLiveStreamId) {
      try {
        const muxStream = await getMuxLiveStream(muxData.muxLiveStreamId);
        muxStatus = muxStream?.status;
      } catch { /* Mux non configuré ou erreur */ }
    }

    return NextResponse.json({
      stream: { ...stream, muxPlaybackId: muxData?.muxPlaybackId || null, muxStatus },
    });
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
    const { status, title, description, thumbnail } = body;

    if (status && ['LIVE', 'ENDED', 'SCHEDULED'].includes(status)) {
      await updateLivestreamStatus(id, status);

      if (status === 'ENDED') {
        const muxData = stream.streamKey ? parseMuxData(stream.streamKey) : null;
        if (muxData?.muxLiveStreamId) {
          signalMuxLiveStreamComplete(muxData.muxLiveStreamId).catch(() => {});
        }
      }
    }

    const updated = await db.liveStream.update({
      where: { id },
      data: { title, description, thumbnail },
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

    const muxData = stream.streamKey ? parseMuxData(stream.streamKey) : null;
    if (muxData?.muxLiveStreamId) {
      deleteMuxLiveStream(muxData.muxLiveStreamId).catch(() => {});
    }

    await db.liveStream.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
