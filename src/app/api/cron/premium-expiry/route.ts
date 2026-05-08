import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringUsers = await db.user.findMany({
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
        premiumExpiresAt: true,
      },
    });

    for (const user of expiringUsers) {
      const daysLeft = user.premiumExpiresAt
        ? Math.ceil((user.premiumExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      console.log(`[NOTIFICATION] Email d'expiration à envoyer à ${user.email} (${daysLeft} jours restants)`);

      // TODO: Integrate email provider (Resend, SendGrid, etc.)
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Votre abonnement Premium expire bientôt',
      //   html: generatePremiumExpiryEmail(user.firstName || 'Utilisateur', daysLeft).html,
      // });
    }

    return NextResponse.json({
      checked: expiringUsers.length,
      users: expiringUsers.map((u) => ({
        email: u.email,
        daysLeft: u.premiumExpiresAt
          ? Math.ceil((u.premiumExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0,
      })),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
