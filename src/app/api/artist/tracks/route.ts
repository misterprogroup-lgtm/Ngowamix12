import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { applyVoiceTag, getTempAudioPath, getFinalAudioPath } from '@/lib/audio-processor';
import { uploadFile } from '@/lib/upload';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import ffprobe from 'ffprobe-static';

export const config = {
  api: {
    bodyParser: false,
  },
};

function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    execFile(ffprobe.path, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], (err, stdout) => {
      if (err) {
        resolve(0);
        return;
      }
      const duration = parseFloat(stdout.trim());
      resolve(isNaN(duration) ? 0 : Math.round(duration));
    });
  });
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    if (!artist.isVerified && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Votre compte artiste doit être vérifié avant de pouvoir publier. Contactez l\'administration.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const albumId = formData.get('albumId') as string;
    const title = formData.get('title') as string;
    const trackNumber = parseInt(formData.get('trackNumber') as string) || 1;
    const isExplicit = formData.get('isExplicit') === 'true';
    const isPremiumOnly = formData.get('isPremiumOnly') === 'true';
    const audioFile = formData.get('audio') as File | null;

    if (!albumId || !title || !audioFile) {
      return NextResponse.json(
        { error: 'Album, titre et fichier audio sont requis' },
        { status: 400 }
      );
    }

    const album = await db.album.findUnique({
      where: { id: albumId },
      select: { artistId: true },
    });

    if (!album || album.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Album non trouvé ou non autorisé' },
        { status: 403 }
      );
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const filename = `${Date.now()}-${audioFile.name}`;

    const tempPath = getTempAudioPath(filename);
    fs.writeFileSync(tempPath, buffer);

    const finalPath = getFinalAudioPath(filename);
    await applyVoiceTag(tempPath, finalPath);

    fs.unlinkSync(tempPath);

    const finalStats = fs.statSync(finalPath);
    const duration = await getAudioDuration(finalPath);

    const uploadResult = await uploadFile(
      fs.readFileSync(finalPath),
      filename,
      'audio'
    );
    fs.unlinkSync(finalPath);

    const audioPath = uploadResult.url;

    const track = await db.track.create({
      data: {
        albumId,
        title,
        slug: slugify(title) + '-' + Date.now().toString(36),
        trackNumber,
        duration,
        audioFile: audioPath,
        isExplicit,
        isPremiumOnly,
        fileSize: finalStats.size,
      },
    });

    await db.album.update({
      where: { id: albumId },
      data: {
        totalTracks: { increment: 1 },
      },
    });

    return NextResponse.json({ track }, { status: 201 });
  } catch (error) {
    console.error('Create track error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la piste' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireRole(['ARTIST', 'LABEL', 'ADMIN']);
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json(
        { error: 'albumId est requis' },
        { status: 400 }
      );
    }

    const artist = await db.artist.findUnique({
      where: { userId: user.sub },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Profil artiste non trouvé' },
        { status: 403 }
      );
    }

    const album = await db.album.findUnique({
      where: { id: albumId },
      select: { artistId: true },
    });

    if (!album || album.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Album non autorisé' },
        { status: 403 }
      );
    }

    const tracks = await db.track.findMany({
      where: { albumId },
      orderBy: { trackNumber: 'asc' },
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Get tracks error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pistes' },
      { status: 500 }
    );
  }
}
