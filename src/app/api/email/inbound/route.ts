import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FORWARD_TO = 'ngowamix@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();

    const id = req.headers.get('svix-id');
    const timestamp = req.headers.get('svix-timestamp');
    const signature = req.headers.get('svix-signature');

    if (!id || !timestamp || !signature) {
      return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
    }

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ error: 'Email non configuré' }, { status: 501 });
    }

    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (secret) {
      try {
        resend.webhooks.verify({
          payload,
          headers: { id, timestamp, signature },
          webhookSecret: secret,
        });
      } catch {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(payload);
    if (event.type !== 'email.received') {
      return NextResponse.json({ ok: true });
    }

    console.log('[INBOUND] Email reçu de:', event.data.from, '- Sujet:', event.data.subject);

    await resend.emails.receiving.forward({
      emailId: event.data.email_id,
      to: FORWARD_TO,
      from: process.env.EMAIL_FROM || 'Ngowamix <noreply@ngowamix.com>',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[INBOUND] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
