import { NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  'utfs.io',
  'uploadthing.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'gravatar.com',
  'www.gravatar.com',
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ALLOWED_DOMAINS.some((d) => {
      if (parsed.hostname === d) return true;
      return parsed.hostname.endsWith('.' + d) && parsed.hostname.split('.' + d).length === 2;
    });
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  if (!isAllowedUrl(url)) {
    return new NextResponse('Domain not allowed', { status: 403 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new NextResponse('Failed to fetch avatar', { status: 502 });
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return new NextResponse('Avatar fetch error', { status: 502 });
  }
}
