import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [siteConfig] = await Promise.all([
      db.siteConfig.findUnique({ where: { id: 'default' } }),
    ]);

    const monthlyPrice = siteConfig?.premiumPrice ?? 1500;
    return NextResponse.json({
      premiumPrice: monthlyPrice,
      premium12mPrice: monthlyPrice * 12,
      premiumCurrency: process.env.PREMIUM_CURRENCY || 'XOF',
      primaryColor: siteConfig?.primaryColor ?? '#f97316',
      fontFamily: siteConfig?.fontFamily ?? 'Inter',
      customCss: siteConfig?.customCss ?? '',
    });
  } catch {
    return NextResponse.json({
      premiumPrice: 1500,
      premium12mPrice: 18000,
      premiumCurrency: 'XOF',
      primaryColor: '#f97316',
      fontFamily: 'Inter',
      customCss: '',
    });
  }
}
