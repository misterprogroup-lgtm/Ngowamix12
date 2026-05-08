import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function PUT(request: Request) {
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

    const contentType = request.headers.get('content-type') || '';
    let avatarPath: string | null | undefined;
    let name: string | undefined;
    let bio: string | undefined;
    let country: string | undefined;
    let genres: string | undefined;
    let socialLinks: string | undefined;
    let coverImage: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      name = formData.get('name') as string || undefined;
      bio = formData.get('bio') as string || undefined;
      country = formData.get('country') as string || undefined;
      genres = formData.get('genres') as string || undefined;
      socialLinks = formData.get('socialLinks') as string || undefined;
      coverImage = formData.get('coverImage') as string || undefined;

      const avatarFile = formData.get('avatar') as File | null;
      if (avatarFile && avatarFile.size > 0) {
        const buffer = Buffer.from(await avatarFile.arrayBuffer());
        const filename = `${Date.now()}-${avatarFile.name.replace(/\s/g, '-')}`;
        const fs = await import('fs');
        const path = await import('path');
        const fullDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        if (!fs.existsSync(fullDir)) {
          fs.mkdirSync(fullDir, { recursive: true });
        }
        fs.writeFileSync(path.join(fullDir, filename), buffer);
        avatarPath = `/uploads/avatars/${filename}`;
      } else {
        avatarPath = formData.get('avatar') as string | null || undefined;
      }
    } else {
      const body = await request.json();
      name = body.name || undefined;
      bio = body.bio !== undefined ? body.bio : undefined;
      country = body.country !== undefined ? body.country : undefined;
      genres = body.genres;
      socialLinks = body.socialLinks;
      coverImage = body.coverImage;
      avatarPath = body.avatar;
    }

    const slug = name ? slugify(name) : artist.slug;

    const data: Record<string, any> = {};
    if (name !== undefined) data.name = name;
    if (name !== undefined) data.slug = slug;
    if (bio !== undefined) data.bio = bio;
    if (country !== undefined) data.country = country;
    if (genres !== undefined) data.genres = Array.isArray(genres) ? genres.join(',') : genres;
    if (socialLinks !== undefined) data.socialLinks = typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks);
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (avatarPath !== undefined) data.avatar = avatarPath;

    const updated = await db.artist.update({
      where: { id: artist.id },
      data,
    });

    return NextResponse.json({ artist: updated });
  } catch (error) {
    console.error('Update artist error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
