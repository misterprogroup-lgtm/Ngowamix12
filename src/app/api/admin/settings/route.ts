import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { encrypt, tryDecrypt } from '@/lib/encrypt';

export async function GET() {
  try {
    await requireRole(['ADMIN']);

    const [siteConfig, paymentProviders] = await Promise.all([
      db.siteConfig.findUnique({ where: { id: 'default' } }),
      db.paymentProviderConfig.findMany({ orderBy: { provider: 'asc' } }),
    ]);

    const maskedProviders = paymentProviders.map((p) => ({
      ...p,
      apiKey: p.apiKey ? tryDecrypt(p.apiKey)?.slice(0, 8) + '...' || null : null,
      siteId: p.siteId ? tryDecrypt(p.siteId)?.slice(0, 8) + '...' || null : null,
    }));

    return NextResponse.json({ siteConfig, paymentProviders: maskedProviders });
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
          premiumPrice: parseInt(data.premiumPrice, 10) || 1500,
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
          premiumPrice: parseInt(data.premiumPrice, 10) || 1500,
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
      const apiKey = data.apiKey ? encrypt(data.apiKey) : null;
      const siteId = data.siteId ? encrypt(data.siteId) : null;
      await db.paymentProviderConfig.upsert({
        where: { provider: data.provider },
        update: {
          apiKey,
          siteId,
          isActive: data.isActive,
          merchantName: data.merchantName,
          description: data.description,
        },
        create: {
          provider: data.provider,
          apiKey,
          siteId,
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
