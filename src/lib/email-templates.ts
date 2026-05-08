export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export function generateWelcomeEmail(name: string): EmailTemplate {
  return {
    to: '',
    subject: 'Bienvenue sur Ngowamix !',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #FF8C00, #FFC300); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Bienvenue sur Ngowamix 🎵</h1>
        </div>
        <div style="padding: 32px; background: #12121a; color: #ffffff;">
          <p style="font-size: 18px;">Bonjour ${name},</p>
          <p>Nous sommes ravis de vous accueillir sur Ngowamix, la plateforme de streaming musical dédiée à la musique africaine francophone.</p>
          <p>Vous pouvez dès maintenant :</p>
          <ul>
            <li>Explorer notre catalogue d'artistes et d'albums</li>
            <li>Écouter de la musique gratuitement</li>
            <li>Ajouter des contenus à vos favoris</li>
            <li>Passer Premium pour une expérience sans limites</li>
          </ul>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.APP_URL}" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Commencer à écouter
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
          Ngowamix — La musique africaine sans limites
        </div>
      </div>
    `,
  };
}

export function generatePaymentConfirmationEmail(
  name: string,
  type: 'SUBSCRIPTION' | 'ALBUM_PURCHASE',
  amount: number,
  details: string
): EmailTemplate {
  const title = type === 'SUBSCRIPTION' ? 'Abonnement Premium activé' : 'Achat d\'album confirmé';
  const message =
    type === 'SUBSCRIPTION'
      ? `Votre abonnement Premium est maintenant actif. Profitez de l'écoute sans publicité et de 30 téléchargements par mois.`
      : `Votre achat a été confirmé. L'album est maintenant disponible dans votre bibliothèque.`;

  return {
    to: '',
    subject: `${title} — Ngowamix`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #12121a; padding: 32px; color: #ffffff;">
          <h1 style="color: #10b981; font-size: 24px;">✓ ${title}</h1>
          <p>Bonjour ${name},</p>
          <p>${message}</p>
          <div style="background: #1a1a25; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 4px 0;"><strong>Montant :</strong> ${amount.toLocaleString('fr-FR')} XOF</p>
            <p style="margin: 4px 0;"><strong>Détails :</strong> ${details}</p>
            <p style="margin: 4px 0;"><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.APP_URL}${type === 'SUBSCRIPTION' ? '/user/subscription' : '/user/purchases'}" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              ${type === 'SUBSCRIPTION' ? 'Mon espace Premium' : 'Mes achats'}
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
          Ngowamix — La musique africaine sans limites
        </div>
      </div>
    `,
  };
}

export function generatePremiumExpiryEmail(name: string, daysLeft: number): EmailTemplate {
  return {
    to: '',
    subject: 'Votre abonnement Premium expire bientôt — Ngowamix',
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #12121a; padding: 32px; color: #ffffff;">
          <h1 style="color: #FFC300; font-size: 24px;">⏰ Votre Premium expire dans ${daysLeft} jours</h1>
          <p>Bonjour ${name},</p>
          <p>Votre abonnement Premium arrivera à échéance dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.</p>
          <p>Après cette date, vous retrouverez l'accès gratuit avec publicités et sans téléchargements.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.APP_URL}/user/subscription" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Renouveler mon abonnement
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
          Ngowamix — La musique africaine sans limites
        </div>
      </div>
    `,
  };
}

export function generateAlbumValidatedEmail(artistName: string, albumTitle: string): EmailTemplate {
  return {
    to: '',
    subject: `Votre album "${albumTitle}" est publié — Ngowamix`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #12121a; padding: 32px; color: #ffffff;">
          <h1 style="color: #10b981; font-size: 24px;">✓ Album publié !</h1>
          <p>Bonjour ${artistName},</p>
          <p>Votre album <strong>"${albumTitle}"</strong> a été validé et est maintenant disponible sur Ngowamix.</p>
          <p>Vos fans peuvent désormais l'écouter et l'acheter.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.APP_URL}/artist/dashboard" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Voir mon dashboard
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
          Ngowamix — La musique africaine sans limites
        </div>
      </div>
    `,
  };
}

export function generateAlbumRejectedEmail(artistName: string, albumTitle: string, reason?: string): EmailTemplate {
  return {
    to: '',
    subject: `Album "${albumTitle}" — Action requise`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #12121a; padding: 32px; color: #ffffff;">
          <h1 style="color: #ef4444; font-size: 24px;">Album non validé</h1>
          <p>Bonjour ${artistName},</p>
          <p>Votre album <strong>"${albumTitle}"</strong> n'a pas pu être validé pour les raisons suivantes :</p>
          ${reason ? `<div style="background: #1a1a25; padding: 16px; border-radius: 8px; margin: 16px 0;">${reason}</div>` : ''}
          <p>Veuillez corriger les problèmes et resoumettre votre album.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.APP_URL}/artist/catalog" style="background: #FF8C00; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Gérer mon catalogue
            </a>
          </div>
        </div>
        <div style="padding: 16px; text-align: center; color: #606070; font-size: 12px;">
          Ngowamix — La musique africaine sans limites
        </div>
      </div>
    `,
  };
}
