import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const album = await db.album.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: 'Album non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('Album fetch error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'album' },
      { status: 500 }
    );
  }
}
