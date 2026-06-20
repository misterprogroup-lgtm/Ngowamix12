import { db } from './db';

const FAMILY_PRICE = parseInt(process.env.FAMILY_PRICE || '7500', 10);
const FAMILY_CURRENCY = process.env.FAMILY_CURRENCY || 'XOF';
const MAX_FAMILY_MEMBERS = parseInt(process.env.MAX_FAMILY_MEMBERS || '6', 10);

export async function getFamilyGroup(ownerId: string) {
  return db.familyGroup.findFirst({
    where: { ownerId },
    include: {
      members: {
        include: {
          user: { select: { id: true, displayName: true, email: true, avatar: true, isPremium: true } },
        },
        orderBy: { invitedAt: 'asc' },
      },
    },
  });
}

export async function createFamilyGroup(ownerId: string, name = 'Famille') {
  const existing = await db.familyGroup.findFirst({ where: { ownerId } });
  if (existing) {
    throw new Error('Vous avez déjà un groupe familial');
  }
  const group = await db.familyGroup.create({
    data: {
      ownerId,
      name,
      price: FAMILY_PRICE,
      currency: FAMILY_CURRENCY,
      maxMembers: MAX_FAMILY_MEMBERS,
    },
  });
  await db.familyMember.create({
    data: {
      groupId: group.id,
      userId: ownerId,
      role: 'ADMIN',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });
  return group;
}

export async function inviteMember(groupId: string, email: string) {
  const group = await db.familyGroup.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) throw new Error('Groupe familial introuvable');
  if (group.members.length >= group.maxMembers) {
    throw new Error('Groupe familial complet');
  }
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error('Utilisateur introuvable');
  const alreadyMember = group.members.find((m) => m.userId === user.id);
  if (alreadyMember) throw new Error('Cet utilisateur est déjà membre');
  return db.familyMember.create({
    data: { groupId, userId: user.id, status: 'INVITED' },
    include: {
      user: { select: { id: true, displayName: true, email: true, avatar: true } },
    },
  });
}

export async function acceptInvitation(groupId: string, userId: string) {
  const member = await db.familyMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!member) throw new Error('Invitation introuvable');
  if (member.status !== 'INVITED') throw new Error('Invitation déjà traitée');
  return db.familyMember.update({
    where: { id: member.id },
    data: { status: 'ACTIVE', joinedAt: new Date() },
  });
}

export async function removeMember(groupId: string, memberId: string) {
  const member = await db.familyMember.findUnique({ where: { id: memberId } });
  if (!member) throw new Error('Membre introuvable');
  if (member.role === 'ADMIN') throw new Error('Impossible de supprimer le admin');
  return db.familyMember.update({
    where: { id: memberId },
    data: { status: 'REMOVED' },
  });
}

export async function getFamilyBenefits(userId: string): Promise<boolean> {
  const membership = await db.familyMember.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { group: true },
  });
  if (!membership) return false;
  return true;
}

export { FAMILY_PRICE, FAMILY_CURRENCY, MAX_FAMILY_MEMBERS };
