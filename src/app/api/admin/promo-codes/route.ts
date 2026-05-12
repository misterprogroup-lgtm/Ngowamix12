import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { z } from 'zod';

const createSchema = z.object({
  code: z.string().min(3).max(20).transform(s => s.toUpperCase()),
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.number().positive(),
  maxUses: z.number().int().min(0).default(0),
  minAmount: z.number().int().min(0).default(0),
  maxAmount: z.number().int().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    await requireRole(['ADMIN']);
    const codes = await db.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(codes);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const data = createSchema.parse(body);

    const existing = await db.promoCode.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json({ error: 'Ce code existe déjà' }, { status: 400 });
    }

    const promo = await db.promoCode.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const body = await request.json();
    const { id, ...data } = body;

    const promo = await db.promoCode.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const { id } = await request.json();
    await db.promoCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
