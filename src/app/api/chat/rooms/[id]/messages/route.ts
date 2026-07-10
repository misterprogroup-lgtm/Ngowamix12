import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getMessages, sendMessage } from '@/lib/chat';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const before = searchParams.get('before') || undefined;

    const messages = await getMessages(id, limit, before);
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
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    const message = await sendMessage(id, user.sub, content.trim());
    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
