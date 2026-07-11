import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { FREE_DOWNLOAD_QUOTA } from '@/lib/constants';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    const trackId = searchParams.get('trackId');

    if (!albumId && !trackId) {
      return NextResponse.json(
        { error: 'albumId ou trackId requis' },
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

    if (albumId) {
      const isAdmin = userData.role === 'ADMIN';
      const isPurchased = isAdmin ? true : await db.purchase.findFirst({
        where: { userId: user.sub, albumId },
      });

      if (!isPurchased && !userData.isPremium) {
        if (userData.downloadsUsedThisMonth >= FREE_DOWNLOAD_QUOTA) {
          return NextResponse.json(
            { error: 'Vous avez atteint la limite de téléchargements gratuits. Abonnez-vous au Premium pour des téléchargements illimités.' },
            { status: 403 }
          );
        }
      }

      const album = await db.album.findUnique({
        where: { id: albumId },
        include: { tracks: true },
      });

      if (!album) {
        return NextResponse.json(
          { error: 'Album non trouvé' },
          { status: 404 }
        );
      }

      const isPaid = isPurchased || userData.isPremium;
      await db.download.create({
        data: {
          userId: user.sub,
          albumId,
          downloadType: isAdmin ? 'PURCHASE' : (isPurchased ? 'PURCHASE' : 'PREMIUM_QUOTA'),
        },
      });

      if (!isPaid) {
        await db.user.update({
          where: { id: user.sub },
          data: { downloadsUsedThisMonth: { increment: 1 } },
        });
      }

      const tracks = album.tracks.map((t) => ({
        title: `${t.trackNumber}. ${t.title}`,
        file: t.audioFile,
      }));

      const downloadToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 300000;

      return NextResponse.json({
        album: {
          title: album.title,
          artist: album.artistId,
          tracks,
        },
        downloadToken,
        expiresAt,
        message: 'Téléchargement prêt',
      });
    }

    if (trackId) {
      const track = await db.track.findUnique({
        where: { id: trackId },
        include: { album: true },
      });

      if (!track) {
        return NextResponse.json(
          { error: 'Piste non trouvée' },
          { status: 404 }
        );
      }

      const isAdmin = userData.role === 'ADMIN';
      const isPurchased = isAdmin ? true : await db.purchase.findFirst({
        where: { userId: user.sub, albumId: track.albumId },
      });

      if (!isPurchased && !userData.isPremium) {
        if (userData.downloadsUsedThisMonth >= FREE_DOWNLOAD_QUOTA) {
          return NextResponse.json(
            { error: 'Vous avez atteint la limite de téléchargements gratuits. Abonnez-vous au Premium pour des téléchargements illimités.' },
            { status: 403 }
          );
        }
      }

      const trackPaid = isPurchased || userData.isPremium;
      await db.download.create({
        data: {
          userId: user.sub,
          trackId,
          albumId: track.albumId,
          downloadType: isAdmin ? 'PURCHASE' : (isPurchased ? 'PURCHASE' : 'PREMIUM_QUOTA'),
        },
      });

      if (!trackPaid) {
        await db.user.update({
          where: { id: user.sub },
          data: { downloadsUsedThisMonth: { increment: 1 } },
        });
      }

      return NextResponse.json({
        track: {
          title: track.title,
          file: track.audioFile,
        },
        message: 'Téléchargement prêt',
      });
    }

    return NextResponse.json(
      { error: 'Paramètres invalides' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}
