import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { inviteMember, acceptInvitation, removeMember } from '@/lib/family';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non connecté' }, { status: 401 });

    const body = await request.json();
    const { action, groupId, email, memberId } = body;

    if (action === 'invite') {
      const group = await db.familyGroup.findUnique({ where: { ownerId: user.sub } });
      if (!group) return NextResponse.json({ error: 'Aucun groupe familial' }, { status: 400 });
      const member = await inviteMember(group.id, email);
      return NextResponse.json({ member });
    }

    if (action === 'accept') {
      const member = await acceptInvitation(groupId, user.sub);
      return NextResponse.json({ member });
    }

    if (action === 'remove') {
      const group = await db.familyGroup.findUnique({ where: { ownerId: user.sub } });
      if (!group) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      await removeMember(group.id, memberId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Erreur';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
