import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (role && role !== 'ALL') {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          displayName: true,
          role: true,
          isPremium: true,
          premiumExpiresAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId et action sont requis' },
        { status: 400 }
      );
    }

    let updated;
    switch (action) {
      case 'block':
        updated = await db.user.update({
          where: { id: userId },
          data: { role: 'LISTENER' },
          select: { id: true, email: true, role: true },
        });
        break;
      case 'activate_premium':
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        updated = await db.user.update({
          where: { id: userId },
          data: { isPremium: true, premiumExpiresAt: endDate },
          select: { id: true, email: true, isPremium: true, premiumExpiresAt: true },
        });
        break;
      case 'revoke_premium':
        updated = await db.user.update({
          where: { id: userId },
          data: { isPremium: false, premiumExpiresAt: null },
          select: { id: true, email: true, isPremium: true },
        });
        break;
      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action sur l\'utilisateur' },
      { status: 500 }
    );
  }
}
