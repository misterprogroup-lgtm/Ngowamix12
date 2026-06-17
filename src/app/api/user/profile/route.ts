import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { uploadFile } from '@/lib/upload';
import { maybeProxyAvatar } from '@/lib/utils';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    const data: Record<string, unknown> = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const displayName = formData.get('displayName') as string | null;
      const phone = formData.get('phone') as string | null;
      const email = formData.get('email') as string | null;
      const avatarFile = formData.get('avatar') as File | null;

      if (displayName !== null) data.displayName = displayName;
      if (phone !== null) data.phone = phone;
      if (email !== null) data.email = email;

      if (avatarFile && avatarFile.size > 0) {
        const buffer = Buffer.from(await avatarFile.arrayBuffer());
        const filename = `${Date.now()}-${avatarFile.name.replace(/\s/g, '-')}`;
        const result = await uploadFile(buffer, filename, 'avatars');
        data.avatar = result.url;
      }
    } else {
      const body = await request.json();
      if (body.displayName !== undefined) data.displayName = body.displayName;
      if (body.phone !== undefined) data.phone = body.phone;
      if (body.email !== undefined) data.email = body.email;
    }

    const updated = await db.user.update({
      where: { id: user.sub },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        phone: true,
        avatar: true,
        role: true,
        isPremium: true,
      },
    });

    const resultUser = { ...updated } as Record<string, unknown>;
    resultUser.avatar = maybeProxyAvatar(updated.avatar);

    const artist = await db.artist.findUnique({ where: { userId: user.sub } });

    if (artist) {
      let artistAvatar = artist.avatar;
      if (data.avatar) {
        const updatedArtist = await db.artist.update({
          where: { id: artist.id },
          data: { avatar: data.avatar as string },
        });
        artistAvatar = updatedArtist.avatar;
      }
      resultUser.artist = { avatar: maybeProxyAvatar(artistAvatar) };
    }

    return NextResponse.json({ user: resultUser });
  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
