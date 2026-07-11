import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, setSessionCookie } from '@/lib/auth';
import { maybeProxyAvatar } from '@/lib/utils';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { checkRateLimit } from '@/lib/rate-limit';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

function getClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error('GOOGLE_CLIENT_ID not configured');
  return id;
}

function generatePassword(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = await checkRateLimit(`google:${ip}`, { maxRequests: 5, windowMs: 60000 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez plus tard.' },
        { status: 429 }
      );
    }

    const { credential } = await request.json();
    if (!credential) {
      return NextResponse.json(
        { error: 'Credential Google requis' },
        { status: 400 }
      );
    }

    const clientId = getClientId();

    let payload: { sub: string; email: string; name?: string; given_name?: string; family_name?: string; picture?: string };
    try {
      const result = await jwtVerify(credential, GOOGLE_JWKS, {
        issuer: ['accounts.google.com', 'https://accounts.google.com'],
        audience: clientId,
      });
      payload = result.payload as typeof payload;
    } catch {
      return NextResponse.json(
        { error: 'Signature Google invalide' },
        { status: 401 }
      );
    }

    if (!payload.email) {
      return NextResponse.json(
        { error: 'Email requis dans le compte Google' },
        { status: 400 }
      );
    }

    const select = {
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
    } as const;

    let user = await db.user.findFirst({
      where: { email: payload.email },
      select,
    });

    if (!user) {
      const firstName = payload.given_name || payload.name || payload.email.split('@')[0];
      const lastName = payload.family_name || '';
      const displayName = payload.name || `${firstName} ${lastName}`.trim();

      user = await db.user.create({
        data: {
          email: payload.email,
          password: generatePassword(),
          firstName,
          lastName,
          displayName,
          avatar: payload.picture || null,
          emailVerified: true,
          role: 'LISTENER',
          termsAccepted: true,
          termsAcceptedAt: new Date(),
        },
        select,
      });
    }

    const token = await createToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      isPremium: user.isPremium,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: { ...user, avatar: maybeProxyAvatar(user.avatar) },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'authentification Google' },
      { status: 500 }
    );
  }
}
