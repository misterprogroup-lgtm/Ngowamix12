import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getChatRooms, createChatRoom } from '@/lib/chat';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const rooms = await getChatRooms(user?.sub);
    return NextResponse.json({ rooms });
  } catch {
    return NextResponse.json({ rooms: [] });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const { type, name, slug, image, artistId, albumId } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Nom et slug requis' }, { status: 400 });
    }

    const room = await createChatRoom({ type, name, slug, image, artistId, albumId });
    return NextResponse.json({ room }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
