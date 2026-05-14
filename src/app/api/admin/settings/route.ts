import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    const [siteConfig, paymentProviders] = await Promise.all([
      db.siteConfig.findUnique({ where: { id: 'default' } }),
      db.paymentProviderConfig.findMany({ orderBy: { provider: 'asc' } }),
    ]);

    return NextResponse.json({ siteConfig, paymentProviders });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireRole(['ADMIN']);

    const body = await request.json();
    const { type, data } = body;

    if (type === 'site') {
      await db.siteConfig.upsert({
        where: { id: 'default' },
        update: {
          appName: data.appName,
          siteDescription: data.siteDescription,
          supportEmail: data.supportEmail,
          premiumPrice: parseInt(data.premiumPrice, 10) || 5000,
          premiumCurrency: data.premiumCurrency,
          downloadQuota: parseInt(data.downloadQuota, 10) || 30,
          primaryColor: data.primaryColor || '#f97316',
          logoUrl: data.logoUrl || null,
          faviconUrl: data.faviconUrl || null,
          fontFamily: data.fontFamily || 'Inter',
          customCss: data.customCss || null,
        },
        create: {
          id: 'default',
          appName: data.appName,
          siteDescription: data.siteDescription,
          supportEmail: data.supportEmail,
          premiumPrice: parseInt(data.premiumPrice, 10) || 5000,
          premiumCurrency: data.premiumCurrency,
          downloadQuota: parseInt(data.downloadQuota, 10) || 30,
          primaryColor: data.primaryColor || '#f97316',
          logoUrl: data.logoUrl || null,
          faviconUrl: data.faviconUrl || null,
          fontFamily: data.fontFamily || 'Inter',
          customCss: data.customCss || null,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (type === 'payment-provider') {
      await db.paymentProviderConfig.upsert({
        where: { provider: data.provider },
        update: {
          apiKey: data.apiKey || null,
          siteId: data.siteId || null,
          isActive: data.isActive,
          merchantName: data.merchantName,
          description: data.description,
        },
        create: {
          provider: data.provider,
          apiKey: data.apiKey || null,
          siteId: data.siteId || null,
          isActive: data.isActive ?? true,
          merchantName: data.merchantName || data.provider,
          description: data.description || '',
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
