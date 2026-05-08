import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['LISTENER', 'ARTIST', 'LABEL']).optional(),
  artistName: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez accepter les conditions d\'utilisation' }),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, role = 'LISTENER', artistName } = result.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const displayName = `${firstName} ${lastName}`;

    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        displayName,
        role: role as never,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        ...(role === 'ARTIST' && artistName && {
          artist: {
            create: {
              name: artistName,
              slug: slugify(artistName),
              genres: '',
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatar: true,
        role: true,
        isPremium: true,
        premiumExpiresAt: true,
        downloadQuota: true,
        downloadsUsedThisMonth: true,
        termsAccepted: true,
      },
    });

    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });

    await setSessionCookie(token);

    return NextResponse.json(
      { user, token, message: 'Inscription réussie' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
