import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, role: true, displayName: true, avatar: true, isPremium: true },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const artist = await db.artist.findUnique({
      where: { userId: user.id },
      select: { avatar: true },
    });

    return NextResponse.json({
      user: {
        ...user,
        artistAvatar: artist?.avatar || null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
