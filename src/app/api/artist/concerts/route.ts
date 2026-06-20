import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { uploadFile } from '@/lib/upload';
import { isS3Url, isUploadThingUrl } from '@/lib/upload';
import { deleteFromS3, deleteFromVercelBlob, isVercelBlobUrl } from '@/lib/storage';

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
    const title = formData.get('title') as string;
    const venue = formData.get('venue') as string;
    const city = formData.get('city') as string;
    const country = formData.get('country') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const description = formData.get('description') as string;
    const totalTickets = parseInt(formData.get('totalTickets') as string) || 0;
    const price = parseInt(formData.get('price') as string) || 0;
    const vipPrice = formData.get('vipPrice') ? parseInt(formData.get('vipPrice') as string) : null;
    const vvipPrice = formData.get('vvipPrice') ? parseInt(formData.get('vvipPrice') as string) : null;
    const posterFile = formData.get('poster') as File | null;

    if (!title || !venue || !city || !date || !time || !totalTickets || !price) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const slug = slugify(title) + '-' + Date.now().toString(36);

    let posterPath: string | null = null;
    if (posterFile && posterFile.size > 0) {
      const buffer = Buffer.from(await posterFile.arrayBuffer());
      const filename = `${Date.now()}-${posterFile.name}`;
      const result = await uploadFile(buffer, filename, 'posters');
      posterPath = result.url;
    }

    let availableTickets = totalTickets;
    let vipTickets = 0;
    let vvipTickets = 0;

    if (vvipPrice) {
      vvipTickets = Math.floor(totalTickets * 0.1);
      vipTickets = Math.floor(totalTickets * 0.15);
    } else if (vipPrice) {
      vipTickets = Math.floor(totalTickets * 0.2);
    }
    availableTickets = totalTickets - vipTickets - vvipTickets;

    const concert = await db.concert.create({
      data: {
        artistId: artist.id,
        title,
        slug,
        venue,
        city,
        country: country || 'CI',
        date: new Date(date),
        time,
        description: description || null,
        poster: posterPath,
        totalTickets,
        availableTickets,
        vipTickets,
        vipAvailableTickets: vipTickets,
        vvipTickets,
        vvipAvailableTickets: vvipTickets,
        price,
        vipPrice,
        vvipPrice,
        isActive: true,
      },
    });

    return NextResponse.json({ concert }, { status: 201 });
  } catch (error) {
    console.error('Create concert error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du concert' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const concerts = await db.concert.findMany({
      where: { artistId: artist.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ concerts });
  } catch (error) {
    console.error('Get concerts error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des concerts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID du concert requis' },
        { status: 400 }
      );
    }

    const concert = await db.concert.findUnique({
      where: { id },
      select: { artistId: true, poster: true },
    });

    if (!concert || concert.artistId !== artist.id) {
      return NextResponse.json(
        { error: 'Concert non trouvé ou non autorisé' },
        { status: 403 }
      );
    }

    await db.concert.delete({
      where: { id },
    });

    if (concert.poster) {
      const url = concert.poster;
      if (isUploadThingUrl(url)) {
        const { deleteUploadedFiles } = await import('@/lib/uploadthing');
        deleteUploadedFiles([url]).catch(() => {});
      } else if (isVercelBlobUrl(url)) {
        deleteFromVercelBlob(url).catch(() => {});
      } else if (isS3Url(url)) {
        const key = url.split('/').slice(-2).join('/');
        deleteFromS3(key).catch(() => {});
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete concert error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du concert' },
      { status: 500 }
    );
  }
}
