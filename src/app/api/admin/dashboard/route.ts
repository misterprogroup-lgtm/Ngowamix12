import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    const [
      totalUsers,
      premiumUsers,
      totalArtists,
      totalAlbums,
      totalTracks,
      totalTransactions,
      pendingAlbums,
      pendingVerifications,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isPremium: true } }),
      db.artist.count(),
      db.album.count(),
      db.track.count(),
      db.transaction.count(),
      db.album.count({ where: { status: 'SUBMITTED' } }),
      db.artist.count({ where: { verificationStatus: 'PENDING' } }),
    ]);

    const [
      revenue,
      recentUsers,
      recentAlbums,
      recentTransactions,
    ] = await Promise.all([
      db.transaction.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, email: true, role: true, isPremium: true, createdAt: true },
      }),
      db.album.findMany({
        where: { status: { in: ['SUBMITTED', 'PUBLISHED'] } },
        include: { artist: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      db.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { email: true } } },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        premiumUsers,
        totalArtists,
        totalAlbums,
        totalTracks,
        totalTransactions,
        pendingAlbums,
        pendingVerifications,
        revenue: revenue._sum.amount || 0,
      },
      recentUsers,
      recentAlbums,
      recentTransactions,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du dashboard' },
      { status: 500 }
    );
  }
}
