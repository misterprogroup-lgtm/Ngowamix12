import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getFamilyGroup, createFamilyGroup } from '@/lib/family';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const group = await getFamilyGroup(user.sub);
    if (!group) return NextResponse.json({ group: null });

    return NextResponse.json({ group });
  } catch {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
    if (!user.isPremium) return NextResponse.json({ error: 'Abonnement premium requis' }, { status: 403 });

    const body = await request.json();
    const group = await createFamilyGroup(user.sub, body.name);
    return NextResponse.json({ group }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
