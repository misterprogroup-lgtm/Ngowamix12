import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { maybeProxyAvatar } from '@/lib/utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userData = await db.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        phone: true,
        phoneVerified: true,
        labelName: true,
        avatar: true,
        role: true,
        isPremium: true,
        premiumExpiresAt: true,
        downloadQuota: true,
        downloadsUsedThisMonth: true,
        quotaResetAt: true,
        termsAccepted: true,
        createdAt: true,
        artist: {
          select: {
            avatar: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const now = new Date();
    if (userData.quotaResetAt <= now) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      await db.user.update({
        where: { id: user.sub },
        data: {
          downloadsUsedThisMonth: 0,
          quotaResetAt: startOfMonth,
        },
      });
      userData.downloadsUsedThisMonth = 0;
      userData.quotaResetAt = startOfMonth;
    }

    const userResponse = {
      ...userData,
      artist: userData.artist ? { avatar: userData.artist.avatar } : null,
      avatar: maybeProxyAvatar(userData.avatar),
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
