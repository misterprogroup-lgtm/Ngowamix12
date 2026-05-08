import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
      const fs = await import('fs');
      const path = await import('path');
      const fullDir = path.join(process.cwd(), 'public', 'uploads', 'posters');
      if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
      }
      fs.writeFileSync(path.join(fullDir, filename), buffer);
      posterPath = `/uploads/posters/${filename}`;
    }

    const vipTickets = vipPrice ? Math.floor(totalTickets * 0.2) : 0;

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
        availableTickets: totalTickets - vipTickets,
        vipTickets,
        vipAvailableTickets: vipTickets,
        price,
        vipPrice,
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
      select: { artistId: true },
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete concert error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du concert' },
      { status: 500 }
    );
  }
}
