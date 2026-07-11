import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { FREE_DOWNLOAD_QUOTA } from '@/lib/constants';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json(
        { error: 'albumId requis' },
        { status: 400 }
      );
    }

    const userData = await db.user.findUnique({
      where: { id: user.sub },
      select: { id: true, role: true, isPremium: true, downloadsUsedThisMonth: true },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const isAdmin = userData.role === 'ADMIN';
    const isPurchased = isAdmin ? true : await db.purchase.findFirst({
      where: { userId: user.sub, albumId },
    });

    const isFreeDownload = !isPurchased && !userData.isPremium;
    if (isFreeDownload && userData.downloadsUsedThisMonth >= FREE_DOWNLOAD_QUOTA) {
      return NextResponse.json(
        { error: 'Vous avez atteint la limite de téléchargements gratuits. Abonnez-vous au Premium pour des téléchargements illimités.' },
        { status: 403 }
      );
    }

    const album = await db.album.findUnique({
      where: { id: albumId },
      include: {
        tracks: { orderBy: { trackNumber: 'asc' } },
        artist: { select: { name: true } },
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: 'Album non trouvé' },
        { status: 404 }
      );
    }

    await db.download.create({
      data: {
        userId: user.sub,
        albumId,
        downloadType: isAdmin ? 'PURCHASE' : (isPurchased ? 'PURCHASE' : 'PREMIUM_QUOTA'),
      },
    });

    if (isFreeDownload) {
      await db.user.update({
        where: { id: user.sub },
        data: { downloadsUsedThisMonth: { increment: 1 } },
      });
    }

    const archive = archiver('zip', { zlib: { level: 5 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));

    const archivePromise = new Promise<void>((resolve, reject) => {
      archive.on('end', () => resolve());
      archive.on('error', (err) => reject(err));
    });

    const safeName = (s: string) => s.replace(/[<>:"/\\|?*]/g, '_').trim();
    const folderName = `${safeName(album.artist.name)} - ${safeName(album.title)}`;
    let hasFiles = false;

    for (const track of album.tracks) {
      if (!track.audioFile) continue;
      try {
        const response = await fetch(track.audioFile, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) continue;
        const buffer = Buffer.from(await response.arrayBuffer());
        const ext = track.audioFile.match(/\.(\w+)(?:\?|$)/)?.[1] || 'mp3';
        archive.append(buffer, {
          name: `${folderName}/${String(track.trackNumber).padStart(2, '0')} - ${safeName(track.title)}.${ext}`,
        });
        hasFiles = true;
      } catch {
        console.error(`Failed to fetch track ${track.id}: ${track.audioFile}`);
      }
    }

    if (!hasFiles) {
      return NextResponse.json(
        { error: 'Aucun fichier audio trouvé pour cet album' },
        { status: 404 }
      );
    }

    archive.finalize();
    await archivePromise;

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
        'Content-Length': String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error('Download ZIP error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}
