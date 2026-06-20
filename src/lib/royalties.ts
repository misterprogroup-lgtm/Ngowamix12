import { db } from './db';

const STREAM_RATE = parseInt(process.env.STREAM_RATE || '1', 10);
const MINIMUM_PAYOUT = parseInt(process.env.MINIMUM_PAYOUT || '5000', 10);

export async function recordStreamPlay(trackId: string, userId: string | null, artistId: string) {
  return db.streamPlay.create({
    data: { trackId, userId, artistId, amount: STREAM_RATE },
  });
}

export async function getArtistEarnings(artistId: string) {
  const [streamCount, totalStreamEarnings, artist] = await Promise.all([
    db.streamPlay.count({ where: { artistId } }),
    db.streamPlay.aggregate({
      where: { artistId },
      _sum: { amount: true },
    }),
    db.artist.findUnique({
      where: { id: artistId },
      select: { balance: true, id: true },
    }),
  ]);

  return {
    balance: artist?.balance || 0,
    totalStreamEarnings: totalStreamEarnings._sum.amount || 0,
    streamCount,
  };
}

export async function getArtistStreamHistory(artistId: string, limit = 50, offset = 0) {
  const [plays, total] = await Promise.all([
    db.streamPlay.findMany({
      where: { artistId },
      include: {
        track: { select: { id: true, title: true, slug: true, album: { select: { title: true, coverImage: true } } } },
        user: { select: { id: true, displayName: true } },
      },
      orderBy: { playedAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.streamPlay.count({ where: { artistId } }),
  ]);
  return { plays, total };
}

export async function requestPayout(artistId: string, amount: number, method = 'MOBILE_MONEY', phone?: string) {
  const artist = await db.artist.findUnique({
    where: { id: artistId },
    select: { balance: true },
  });
  if (!artist) throw new Error('Artiste introuvable');
  if (amount < MINIMUM_PAYOUT) {
    throw new Error(`Montant minimum de retrait: ${MINIMUM_PAYOUT} XOF`);
  }
  if (amount > artist.balance) {
    throw new Error('Solde insuffisant');
  }
  const [payout] = await db.$transaction([
    db.payoutRequest.create({
      data: {
        artistId,
        amount,
        method,
        phone,
        status: 'PENDING',
      },
    }),
    db.artist.update({
      where: { id: artistId },
      data: { balance: { decrement: amount } },
    }),
  ]);
  return payout;
}

export async function getPayoutHistory(artistId: string) {
  return db.payoutRequest.findMany({
    where: { artistId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function processPayout(payoutId: string, status: 'COMPLETED' | 'FAILED', note?: string) {
  const payout = await db.payoutRequest.findUnique({ where: { id: payoutId } });
  if (!payout) throw new Error('Demande introuvable');
  if (status === 'FAILED') {
    await db.artist.update({
      where: { id: payout.artistId },
      data: { balance: { increment: payout.amount } },
    });
  }
  return db.payoutRequest.update({
    where: { id: payoutId },
    data: {
      status,
      note,
      ...(status === 'COMPLETED' ? { processedAt: new Date() } : {}),
    },
  });
}

export async function getTopEarningArtists(limit = 10) {
  return db.artist.findMany({
    orderBy: { balance: 'desc' },
    take: limit,
    select: { id: true, name: true, slug: true, avatar: true, balance: true },
  });
}

export { STREAM_RATE, MINIMUM_PAYOUT };
