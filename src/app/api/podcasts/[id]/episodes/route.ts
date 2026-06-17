import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const { title, description, audioFile, duration, fileSize, episodeNumber, isPublished } = body;

    if (!title || !audioFile) {
      return NextResponse.json(
        { error: 'title et audioFile requis' },
        { status: 400 }
      );
    }

    const episode = await db.episode.create({
      data: {
        podcastId: id,
        title,
        description,
        audioFile,
        duration: duration || 0,
        fileSize,
        episodeNumber: episodeNumber || 1,
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json({ episode }, { status: 201 });
  } catch (error) {
    console.error('Episode create error:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'épisode" },
      { status: 500 }
    );
  }
}
