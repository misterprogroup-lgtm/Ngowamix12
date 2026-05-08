import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Politique de Confidentialité</h1>
      <p className="text-text-secondary mb-8">Dernière mise à jour : 6 mai 2026</p>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">1. Qui sommes-nous</h2>
          <p>
            Ngowamix est une plateforme de musique africaine numérique. Nous sommes engagés dans la protection de votre vie privée et la sécurité de vos données personnelles. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">2. Données collectées</h2>
          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">2.1 Données que vous nous fournissez</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Informations de compte : nom, prénom, adresse email</li>
            <li>Informations de profil : nom d'artiste, biographie, photo de profil</li>
            <li>Données de paiement : informations de transaction (traitées par nos prestataires CinetPay/Stripe)</li>
            <li>Contenu publié : albums, singles, EPs, concerts, images et descriptions</li>
            <li>Communications : messages envoyés au support technique</li>
          </ul>

          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">2.2 Données collectées automatiquement</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Données d'utilisation : pages visitées, musiques écoutées, achats effectués</li>
            <li>Données techniques : adresse IP, type de navigateur, système d'exploitation</li>
            <li>Données de connexion : dates et heures de connexion, durée des sessions</li>
            <li>Informations sur le dispositif : type d'appareil, résolution d'écran</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">3. Utilisation des données</h2>
          <p>Nous utilisons vos données pour :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Créer et gérer votre compte</li>
            <li>Fournir et améliorer nos services (recommandations musicales, recherche)</li>
            <li>Traiter vos paiements et vous envoyer des reçus</li>
            <li>Communiquer avec vous (notifications, informations sur le service, support)</li>
            <li>Assurer la sécurité de la plateforme et prévenir la fraude</li>
            <li>Analyser l'utilisation du service pour améliorer l'expérience utilisateur</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">4. Partage des données</h2>
          <p>
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager certaines informations avec :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Prestataires de paiement</strong> — CinetPay et Stripe pour le traitement des transactions</li>
            <li><strong>Hébergeurs</strong> — Pour le stockage sécurisé des données</li>
            <li><strong>Artistes et labels</strong> — Données agrégées et anonymisées sur les performances de leurs contenus</li>
            <li><strong>Autorités légales</strong> — Si requis par la loi ou pour protéger nos droits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">5. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Chiffrement des mots de passe (bcrypt)</li>
            <li>Connexions sécurisées via HTTPS/TLS</li>
            <li>Tokens de session sécurisés avec expiration</li>
            <li>Accès restreint aux données personnelles pour notre personnel</li>
            <li>Backups réguliers et sécurisés de la base de données</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">6. Durée de conservation</h2>
          <p>
            Nous conservons vos données aussi longtemps que votre compte est actif. Après la suppression de votre compte :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Les données personnelles sont supprimées sous 30 jours</li>
            <li>Les données de transaction sont conservées pour la durée légale requise</li>
            <li>Les contenus musicaux publiés sont retirés sauf accord contraire avec l'artiste/label</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">7. Vos droits</h2>
          <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Droit d'accès</strong> — Obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification</strong> — Corriger des données inexactes ou incomplètes</li>
            <li><strong>Droit à l'effacement</strong> — Demander la suppression de vos données</li>
            <li><strong>Droit à la portabilité</strong> — Recevoir vos données dans un format structuré</li>
            <li><strong>Droit d'opposition</strong> — Vous opposer au traitement de vos données</li>
            <li><strong>Droit de limitation</strong> — Limiter le traitement de vos données</li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits, contactez-nous à : contact@ngowamix.com
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">8. Cookies</h2>
          <p>
            Ngowamix utilise des cookies et technologies similaires pour :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Maintenir votre session de connexion</li>
            <li>Mémoriser vos préférences (thème, langue)</li>
            <li>Analyser l'utilisation du service</li>
          </ul>
          <p className="mt-2">
            Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">9. Modification de cette politique</h2>
          <p>
            Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications seront publiées sur cette page avec une date de mise à jour révisée. Nous vous informerons des changements substantiels par notification sur la plateforme ou par email.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">10. Contact</h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou vos données personnelles :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Email : contact@ngowamix.com</li>
            <li>Adresse : [Adresse du siège social]</li>
          </ul>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-border text-center">
        <Link href="/" className="text-primary hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
