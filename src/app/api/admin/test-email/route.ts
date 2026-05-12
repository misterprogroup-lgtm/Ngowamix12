import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { requireRole } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireRole(['ADMIN']);
    const { to } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const result = await sendEmail(
      to,
      'Test Ngowamix',
      '<p>Email de test — si vous lisez ceci, Resend fonctionne.</p>'
    );

    return NextResponse.json({ success: result, message: result ? 'Email envoyé' : 'Échec envoi' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
