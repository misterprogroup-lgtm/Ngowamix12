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
  html: string
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
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF8C00, #FFC300); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Réinitialisation du mot de passe</h1>
        </div>
        <div style="padding: 32px; background: #12121a; color: #ffffff;">
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
        </div>
        <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
          Ngowamix — La musique africaine sans limites
        </div>
      </div>
    `,
  };
}
