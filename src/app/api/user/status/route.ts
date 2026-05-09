import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

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
        createdAt: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const now = new Date();
    let needsQuotaReset = false;
    if (userData.quotaResetAt && now > userData.quotaResetAt) {
      needsQuotaReset = true;
    }

    if (needsQuotaReset) {
      await db.user.update({
        where: { id: user.sub },
        data: {
          downloadsUsedThisMonth: 0,
          quotaResetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        },
      });

      userData.downloadsUsedThisMonth = 0;
      userData.quotaResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    return NextResponse.json({
      user: userData,
      needsQuotaReset,
    });
  } catch (error) {
    console.error('Get user status error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
