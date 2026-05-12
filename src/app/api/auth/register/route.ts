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
  phone: z.string().optional(),
  role: z.enum(['LISTENER', 'ARTIST', 'LABEL']).optional(),
  artistName: z.string().optional(),
  labelName: z.string().optional(),
  referralCode: z.string().optional(),
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

    const { firstName, lastName, email, password, phone, role = 'LISTENER', artistName, labelName, referralCode } = result.data;

    let referredBy: string | null = null;
    if (referralCode) {
      const code = referralCode.toUpperCase().trim();
      const ref = await db.referralCode.findUnique({ where: { code } });
      if (ref) {
        referredBy = ref.userId;
      }
    }

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
        phone: phone || null,
        password: hashedPassword,
        displayName,
        labelName: labelName || null,
        role: role as never,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
        ...(referredBy ? { referredBy } : {}),
        ...(role === 'ARTIST' && artistName && {
          artist: {
            create: {
              name: artistName,
              slug: slugify(artistName),
              genres: '',
            },
          },
        }),
        ...(role === 'LABEL' && labelName && {
          label: {
            create: {
              name: labelName,
              slug: slugify(labelName),
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
        phone: true,
        phoneVerified: true,
        labelName: true,
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
  } catch (error: any) {
    console.error('Register error:', error);
    let message = 'Erreur lors de l\'inscription';
    if (error?.message?.includes('connect to the database') || error?.message?.includes('does not exist')) {
      message = 'Erreur de connexion à la base de données. Vérifiez que DATABASE_URL est configurée sur Vercel.';
    }
    if (error?.code === 'P2021') {
      message = 'La base de données est vide. Exécutez npx prisma db push pour créer les tables.';
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
