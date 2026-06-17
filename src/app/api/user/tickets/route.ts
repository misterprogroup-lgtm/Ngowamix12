import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ tickets: [] }, { status: 401 });
    }

    const tickets = await db.ticket.findMany({
      where: { userId: user.sub },
      include: {
        concert: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            city: true,
            date: true,
            time: true,
            poster: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json({ tickets: [] });
  }
}
