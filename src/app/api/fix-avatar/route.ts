import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const labelUser = await db.user.findUnique({
      where: { email: 'label@ngowamix.com' },
      include: { artist: true },
    });

    if (!labelUser) {
      return NextResponse.json({ error: 'Label user not found' }, { status: 404 });
    }

    if (labelUser.artist) {
      await db.artist.update({
        where: { id: labelUser.artist.id },
        data: { avatar: '/images/label-avatar.svg' },
      });
      return NextResponse.json({
        message: 'Avatar fixé',
        old: labelUser.artist.avatar,
        new: '/images/label-avatar.svg',
      });
    }

    return NextResponse.json({ message: 'Pas de artiste associé' });
  } catch (error) {
    console.error('Fix avatar error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
