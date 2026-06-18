import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
      select: {
        payoutMethod: true,
        payoutPhone: true,
        payoutAccountName: true,
        payoutBankName: true,
        payoutBankAccount: true,
        streamServerUrl: true,
      },
    });

    if (!artist) return NextResponse.json({ error: 'Artiste introuvable' }, { status: 404 });

    return NextResponse.json({ config: artist });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) return NextResponse.json({ error: 'Artiste introuvable' }, { status: 404 });

    const updated = await db.artist.update({
      where: { id: artist.id },
      data: {
        payoutMethod: body.payoutMethod ?? artist.payoutMethod,
        payoutPhone: body.payoutPhone ?? artist.payoutPhone,
        payoutAccountName: body.payoutAccountName ?? artist.payoutAccountName,
        payoutBankName: body.payoutBankName ?? artist.payoutBankName,
        payoutBankAccount: body.payoutBankAccount ?? artist.payoutBankAccount,
        streamServerUrl: body.streamServerUrl ?? artist.streamServerUrl,
      },
      select: {
        payoutMethod: true,
        payoutPhone: true,
        payoutAccountName: true,
        payoutBankName: true,
        payoutBankAccount: true,
        streamServerUrl: true,
      },
    });

    return NextResponse.json({ config: updated });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
