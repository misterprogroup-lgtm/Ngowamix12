import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [siteConfig, paymentProviders] = await Promise.all([
      db.siteConfig.findUnique({ where: { id: 'default' } }),
      db.paymentProviderConfig.findMany({ select: { provider: true, isActive: true, merchantName: true } }),
    ]);

    return NextResponse.json({
      premiumPrice: siteConfig?.premiumPrice ?? 5000,
      premiumCurrency: siteConfig?.premiumCurrency ?? 'XOF',
      downloadQuota: siteConfig?.downloadQuota ?? 30,
      primaryColor: siteConfig?.primaryColor ?? '#f97316',
      fontFamily: siteConfig?.fontFamily ?? 'Inter',
      logoUrl: siteConfig?.logoUrl ?? null,
      faviconUrl: siteConfig?.faviconUrl ?? null,
      customCss: siteConfig?.customCss ?? null,
      paymentProviders,
    });
  } catch {
    return NextResponse.json({
      premiumPrice: 5000,
      premiumCurrency: 'XOF',
      downloadQuota: 30,
      primaryColor: '#f97316',
      fontFamily: 'Inter',
      logoUrl: null,
      faviconUrl: null,
      customCss: null,
      paymentProviders: [],
    });
  }
}
