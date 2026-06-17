import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['ADMIN']);
    const { id } = await params;

    const ad = await db.ad.findUnique({ where: { id } });
    if (!ad) {
      return NextResponse.json({ error: 'Publicité non trouvée' }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Get ad error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la publicité' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['ADMIN']);
    const { id } = await params;
    const body = await request.json();
    const { image, sponsor, text, link, audioFile, placement, isActive, sortOrder } = body;

    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Publicité non trouvée' }, { status: 404 });
    }

    const ad = await db.ad.update({
      where: { id },
      data: {
        image: image !== undefined ? image : existing.image,
        sponsor: sponsor ?? existing.sponsor,
        text: text ?? existing.text,
        link: link !== undefined ? link : existing.link,
        audioFile: audioFile !== undefined ? audioFile : existing.audioFile,
        placement: placement ?? existing.placement,
        isActive: isActive ?? existing.isActive,
        sortOrder: sortOrder ?? existing.sortOrder,
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Update ad error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la publicité' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(['ADMIN']);
    const { id } = await params;

    const existing = await db.ad.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Publicité non trouvée' }, { status: 404 });
    }

    await db.ad.delete({ where: { id } });

    return NextResponse.json({ message: 'Publicité supprimée' });
  } catch (error) {
    console.error('Delete ad error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la publicité' },
      { status: 500 }
    );
  }
}
