import { db } from './db';

export async function awardReferralCommission(userId: string, subscriptionAmount: number, transactionId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { referredBy: true },
    });

    if (!user?.referredBy) return;

    const artist = await db.artist.findUnique({
      where: { userId: user.referredBy },
      select: { id: true, balance: true },
    });

    if (!artist) return;

    const commissionPercent = 10;
    const commissionAmount = Math.floor(subscriptionAmount * commissionPercent / 100);

    if (commissionAmount <= 0) return;

    await db.$transaction([
      db.commission.create({
        data: {
          artistId: artist.id,
          referredUserId: userId,
          transactionId,
          subscriptionAmount,
          commissionPercent,
          commissionAmount,
          status: 'PAID',
        },
      }),
      db.artist.update({
        where: { id: artist.id },
        data: { balance: { increment: commissionAmount } },
      }),
    ]);
  } catch (e) {
    console.error('[commission] Error awarding referral commission:', e);
  }
}
