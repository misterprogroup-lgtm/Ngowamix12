import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function isOwner(playlistId: string, userId: string): Promise<boolean> {
  const playlist = await db.playlist.findFirst({
    where: { id: playlistId, userId },
    select: { id: true },
  });
  return !!playlist;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const isOwner_ = await isOwner(id, user.sub);
    const isCollab = await db.playlistCollaborator.findUnique({
      where: { playlistId_userId: { playlistId: id, userId: user.sub } },
    });

    if (!isOwner_ && !isCollab) {
      return NextResponse.json(
        { error: 'Playlist non trouvée' },
        { status: 404 }
      );
    }

    const collaborators = await db.playlistCollaborator.findMany({
      where: { playlistId: id },
      include: {
        user: { select: { id: true, displayName: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ collaborators });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des collaborateurs' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { email, role } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const isOwner_ = await isOwner(id, user.sub);
    if (!isOwner_) {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut ajouter des collaborateurs' },
        { status: 403 }
      );
    }

    const targetUser = await db.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Aucun utilisateur trouvé avec cet email' },
        { status: 404 }
      );
    }

    if (targetUser.id === user.sub) {
      return NextResponse.json(
        { error: 'Tu ne peux pas t\'ajouter toi-même' },
        { status: 400 }
      );
    }

    const existing = await db.playlistCollaborator.findUnique({
      where: { playlistId_userId: { playlistId: id, userId: targetUser.id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Cet utilisateur est déjà collaborateur' },
        { status: 409 }
      );
    }

    const collaborator = await db.playlistCollaborator.create({
      data: {
        playlistId: id,
        userId: targetUser.id,
        role: role === 'VIEWER' ? 'VIEWER' : 'EDITOR',
      },
      include: {
        user: { select: { id: true, displayName: true, email: true, avatar: true } },
      },
    });

    await db.playlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ collaborator }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du collaborateur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { collaboratorId, role } = await request.json();

    if (!collaboratorId || !role) {
      return NextResponse.json(
        { error: 'collaboratorId et role requis' },
        { status: 400 }
      );
    }

    const isOwner_ = await isOwner(id, user.sub);
    if (!isOwner_) {
      return NextResponse.json(
        { error: 'Seul le propriétaire peut modifier les collaborateurs' },
        { status: 403 }
      );
    }

    const collaborator = await db.playlistCollaborator.update({
      where: { id: collaboratorId, playlistId: id },
      data: { role: role === 'VIEWER' ? 'VIEWER' : 'EDITOR' },
      include: {
        user: { select: { id: true, displayName: true, email: true, avatar: true } },
      },
    });

    return NextResponse.json({ collaborator });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de la modification du collaborateur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { collaboratorId } = await request.json();

    if (!collaboratorId) {
      return NextResponse.json(
        { error: 'collaboratorId requis' },
        { status: 400 }
      );
    }

    const isOwner_ = await isOwner(id, user.sub);
    const isSelfRemoval = await db.playlistCollaborator.findFirst({
      where: { id: collaboratorId, userId: user.sub },
    });

    if (!isOwner_ && !isSelfRemoval) {
      return NextResponse.json(
        { error: 'Action non autorisée' },
        { status: 403 }
      );
    }

    await db.playlistCollaborator.delete({
      where: { id: collaboratorId, playlistId: id },
    });

    await db.playlist.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: 'Collaborateur retiré' });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors du retrait du collaborateur' },
      { status: 500 }
    );
  }
}
