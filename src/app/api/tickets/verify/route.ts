import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Code QR requis' },
        { status: 400 }
      );
    }

    const ticket = await db.ticket.findUnique({
      where: { qrCode: code },
      include: {
        concert: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            city: true,
            country: true,
            date: true,
            time: true,
            poster: true,
            artist: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Billet introuvable', valid: false },
        { status: 404 }
      );
    }

    if (ticket.status === 'USED') {
      return NextResponse.json({
        valid: false,
        error: 'Ce billet a déjà été utilisé',
        ticket: {
          id: ticket.id,
          type: ticket.type,
          status: ticket.status,
          usedAt: ticket.purchasedAt,
          concert: ticket.concert,
        },
      });
    }

    if (ticket.status === 'CANCELLED') {
      return NextResponse.json({
        valid: false,
        error: 'Ce billet a été annulé',
        ticket: {
          id: ticket.id,
          type: ticket.type,
          status: ticket.status,
          concert: ticket.concert,
        },
      });
    }

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        type: ticket.type,
        price: ticket.price,
        status: ticket.status,
        purchasedAt: ticket.purchasedAt,
        recipientEmail: ticket.recipientEmail,
        concert: ticket.concert,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la vérification', valid: false },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code QR requis' },
        { status: 400 }
      );
    }

    const ticket = await db.ticket.findUnique({
      where: { qrCode: code },
      include: {
        concert: {
          select: {
            id: true,
            title: true,
            venue: true,
            city: true,
            date: true,
            time: true,
            artist: { select: { name: true, userId: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Billet introuvable', valid: false },
        { status: 404 }
      );
    }

    if (ticket.status !== 'PURCHASED') {
      return NextResponse.json({
        valid: false,
        error: ticket.status === 'USED'
          ? 'Ce billet a déjà été utilisé'
          : 'Ce billet n\'est plus valide',
        ticket: { id: ticket.id, status: ticket.status },
      });
    }

    await db.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED' },
    });

    return NextResponse.json({
      valid: true,
      message: 'Billet validé avec succès',
      ticket: {
        id: ticket.id,
        type: ticket.type,
        recipientEmail: ticket.recipientEmail,
        concert: {
          title: ticket.concert.title,
          venue: ticket.concert.venue,
          date: ticket.concert.date,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la validation', valid: false },
      { status: 500 }
    );
  }
}
