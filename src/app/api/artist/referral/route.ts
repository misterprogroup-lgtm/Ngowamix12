import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    }

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
      select: { id: true, slug: true, name: true, balance: true },
    });

    if (!artist) {
      return NextResponse.json({ error: 'Vous devez être un artiste' }, { status: 403 });
    }

    const referralCode = artist.slug;

    const commissions = await db.commission.findMany({
      where: { artistId: artist.id, status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    return NextResponse.json({
      referralCode: referralCode.toUpperCase(),
      artistName: artist.name,
      balance: artist.balance,
      totalCommissions,
      commissionCount: commissions.length,
      recentCommissions: commissions.slice(0, 10),
    });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
