import { Resend } from 'resend';

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client = new Resend(key);
  return client;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  replyTo?: string
): Promise<boolean> {
  const resend = getClient();
  if (!resend) {
    console.warn('[EMAIL] RESEND_API_KEY not configured. Email not sent.');
    return false;
  }

  try {
    const from = process.env.EMAIL_FROM || 'Ngowamix <onboarding@resend.dev>';
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      ...(replyTo && { reply_to: replyTo }),
    });

    if (error) {
      console.error('[EMAIL] Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[EMAIL] Send error:', error);
    return false;
  }
}

export function generateResetEmail(
  name: string,
  resetLink: string
): { subject: string; html: string } {
  return {
    subject: 'Réinitialisation de votre mot de passe — Ngowamix',
    html: baseHtml({
      title: 'Réinitialisation du mot de passe',
      content: `
        <p style="font-size: 18px;">Bonjour ${name},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color: #a0a0b0; font-size: 14px;">Ce lien expire dans 1 heure.</p>
        <p style="color: #a0a0b0; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    }),
  };
}

function baseHtml({ title, content }: { title: string; content: string }): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF8C00, #FFC300); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
      </div>
      <div style="padding: 32px; background: #12121a; color: #ffffff;">
        ${content}
      </div>
      <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
        Ngowamix — La musique africaine sans limites
      </div>
    </div>
  `;
}

export function generateEmailVerificationEmail(
  name: string,
  code: string
): { subject: string; html: string } {
  return {
    subject: 'Vérification de votre email — Ngowamix',
    html: baseHtml({
      title: 'Vérification de votre email',
      content: `
        <p style="font-size: 18px;">Bonjour ${name},</p>
        <p>Merci de vous être inscrit sur Ngowamix !</p>
        <p>Utilisez le code ci-dessous pour vérifier votre adresse email :</p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="background: #1a1a25; border-radius: 12px; padding: 24px; display: inline-block;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #FF8C00;">${code}</span>
          </div>
        </div>
        <p style="color: #a0a0b0; font-size: 14px;">Ce code expire dans 10 minutes.</p>
        <p style="color: #a0a0b0; font-size: 14px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
      `,
    }),
  };
}

export async function sendTicketEmail(params: {
  email: string;
  userName: string;
  concertTitle: string;
  venue: string;
  city: string;
  date: string;
  time: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  qrCodes: string[];
  transactionId: string;
}) {
  const { email, userName, concertTitle, venue, city, date, time, ticketType, quantity, totalAmount, qrCodes, transactionId } = params;

  const typeLabel = { STANDARD: 'Standard', VIP: 'VIP', VVIP: 'VVIP' }[ticketType] || ticketType;
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const qrRows = qrCodes.map((code, i) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #2a2a35; text-align: center;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://ngowamix.com/ticket/${code}`)}" alt="QR Code" style="width: 120px; height: 120px;" />
        <p style="color: #a0a0b0; font-size: 12px; margin-top: 4px;">Billet #${i + 1}</p>
        <p style="color: #606070; font-size: 10px; word-break: break-all;">${code}</p>
      </td>
    </tr>
  `).join('');

  const html = baseHtml({
    title: '🎫 Confirmation d\'achat',
    content: `
      <p style="font-size: 18px;">Bonjour ${userName},</p>
      <p>Merci pour votre achat ! Voici les détails de votre réservation :</p>

      <div style="background: #1a1a25; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h2 style="color: #FF8C00; margin: 0 0 16px 0; font-size: 20px;">${concertTitle}</h2>
        <table style="width: 100%; color: #ffffff; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #a0a0b0;">Lieu</td>
            <td style="padding: 6px 0; text-align: right;">${venue}, ${city}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a0a0b0;">Date</td>
            <td style="padding: 6px 0; text-align: right;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a0a0b0;">Heure</td>
            <td style="padding: 6px 0; text-align: right;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a0a0b0;">Catégorie</td>
            <td style="padding: 6px 0; text-align: right;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a0a0b0;">Quantité</td>
            <td style="padding: 6px 0; text-align: right;">${quantity}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a0a0b0;">Total payé</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #FF8C00;">${totalAmount.toLocaleString('fr-FR')} FCFA</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 16px; font-weight: bold;">Vos billets (QR codes) :</p>
      <p style="color: #a0a0b0; font-size: 13px;">Présentez ces QR codes à l'entrée du concert.</p>
      <table style="width: 100%;">${qrRows}</table>

      <div style="background: #1a1a25; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="color: #a0a0b0; font-size: 12px; margin: 0;">
          Référence de transaction : <strong style="color: #ffffff;">${transactionId}</strong>
        </p>
      </div>
    `,
  });

  return sendEmail(email, `🎫 Vos billets pour ${concertTitle} — Ngowamix`, html);
}

export function generatePremiumExpiryEmail(
  name: string,
  daysLeft: number,
): { subject: string; html: string } {
  const subject = daysLeft > 0
    ? `Votre abonnement Premium expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''} — Ngowamix`
    : 'Votre abonnement Premium a expiré — Ngowamix';

  const content = daysLeft > 0
    ? `
        <p style="font-size: 18px;">Bonjour ${name},</p>
        <p>Votre abonnement <strong>Premium</strong> arrivera à expiration dans <strong>${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong>.</p>
        <p>Une fois expiré, vous perdrez l'accès à :</p>
        <ul style="color: #a0a0b0; line-height: 2;">
          <li>Écoute sans publicité</li>
          <li>Qualité audio supérieure</li>
          <li>Téléchargements illimités</li>
          <li>Contenu exclusif Premium</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.APP_URL || 'https://ngowamix.com'}/premium" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Renouveler mon abonnement
          </a>
        </div>
        <p style="color: #a0a0b0; font-size: 14px;">ou rendez-vous dans votre <a href="${process.env.APP_URL || 'https://ngowamix.com'}/user/subscription" style="color: #FF8C00;">espace abonnement</a>.</p>
      `
    : `
        <p style="font-size: 18px;">Bonjour ${name},</p>
        <p>Votre abonnement <strong>Premium</strong> est arrivé à expiration.</p>
        <p>Vous avez désormais perdu l'accès aux fonctionnalités Premium :</p>
        <ul style="color: #a0a0b0; line-height: 2;">
          <li>Écoute sans publicité</li>
          <li>Qualité audio supérieure</li>
          <li>Téléchargements illimités</li>
          <li>Contenu exclusif Premium</li>
        </ul>
        <p>Mais vous pouvez réactiver votre abonnement à tout moment !</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.APP_URL || 'https://ngowamix.com'}/premium" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Réactiver mon abonnement
          </a>
        </div>
      `;

  return { subject, html: baseHtml({ title: 'Abonnement Premium', content }) };
}
