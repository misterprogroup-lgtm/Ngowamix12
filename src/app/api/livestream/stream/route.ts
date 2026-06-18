import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const streamKey = authHeader.slice(7);

    const stream = await db.liveStream.findUnique({ where: { streamKey } });
    if (!stream) return NextResponse.json({ error: 'Clé invalide' }, { status: 401 });

    await db.liveStream.update({
      where: { id: stream.id },
      data: { status: 'LIVE', startedAt: new Date() },
    });

    return NextResponse.json({ id: stream.id, status: 'LIVE' });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const streamKey = authHeader.slice(7);

    const stream = await db.liveStream.findUnique({ where: { streamKey } });
    if (!stream) return NextResponse.json({ error: 'Clé invalide' }, { status: 401 });

    await db.liveStream.update({
      where: { id: stream.id },
      data: { status: 'ENDED', endedAt: new Date() },
    });

    return NextResponse.json({ status: 'ENDED' });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
