import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requestPayout, getPayoutHistory } from '@/lib/royalties';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) return NextResponse.json({ error: 'Vous devez être un artiste' }, { status: 403 });

    const payouts = await getPayoutHistory(artist.id);
    return NextResponse.json({ payouts });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });
    if (!artist) return NextResponse.json({ error: 'Vous devez être un artiste' }, { status: 403 });

    const body = await request.json();
    const { amount, method, phone } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
    }

    const payout = await requestPayout(artist.id, amount, method, phone);
    return NextResponse.json({ payout }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
