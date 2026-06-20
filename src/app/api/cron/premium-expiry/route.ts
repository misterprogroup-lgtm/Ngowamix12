import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, generatePremiumExpiryEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringSoonUsers = await db.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        displayName: true,
        premiumExpiresAt: true,
      },
    });

    for (const user of expiringSoonUsers) {
      const daysLeft = user.premiumExpiresAt
        ? Math.ceil((user.premiumExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const name = user.firstName || user.displayName || user.email;

      const sent = await sendEmail(
        user.email,
        generatePremiumExpiryEmail(name, daysLeft).subject,
        generatePremiumExpiryEmail(name, daysLeft).html,
      );

      if (sent) {
        console.log(`[PREMIUM_EXPIRY] Email envoyé (${daysLeft} jours restants)`);
      } else {
        console.error(`[PREMIUM_EXPIRY] Échec envoi email`);
      }
    }

    const alreadyExpired = await db.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: { lt: now },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        displayName: true,
        premiumExpiresAt: true,
      },
    });

    for (const user of alreadyExpired) {
      const name = user.firstName || user.displayName || user.email;

      const sent = await sendEmail(
        user.email,
        generatePremiumExpiryEmail(name, 0).subject,
        generatePremiumExpiryEmail(name, 0).html,
      );

      await db.user.update({
        where: { id: user.id },
        data: { isPremium: false, premiumExpiresAt: null },
      });

      if (sent) {
        console.log(`[PREMIUM_EXPIRED] Email envoyé et abonnement désactivé`);
      } else {
        console.error(`[PREMIUM_EXPIRED] Abonnement désactivé mais échec envoi email`);
      }
    }

    return NextResponse.json({
      notified: expiringSoonUsers.length,
      expired: alreadyExpired.length,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
