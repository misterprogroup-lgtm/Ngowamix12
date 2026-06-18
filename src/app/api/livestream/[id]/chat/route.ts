import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getChatMessages, sendChatMessage, trackViewerJoin, trackViewerLeave } from '@/lib/livestream';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const before = searchParams.get('before') || undefined;

    const messages = await getChatMessages(id, limit, before);
    return NextResponse.json({ messages: messages.reverse() });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const { message } = await request.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const msg = await sendChatMessage(id, user.sub, message.trim());
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
