import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Conditions Générales d'Utilisation</h1>
      <p className="text-text-secondary mb-8">Dernière mise à jour : 6 mai 2026</p>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">1. Présentation du service</h2>
          <p>
            Ngowamix est une plateforme numérique dédiée à la découverte, l'écoute et l'achat de musique africaine. Le service permet aux artistes et labels de publier leurs créations musicales et aux auditeurs d'écouter, télécharger et acheter des albums, singles et EPs.
          </p>
          <p>
            Ngowamix agit en tant qu'intermédiaire entre les créateurs de contenu musical (artistes et labels) et les utilisateurs finaux (auditeurs). La plateforme propose également un système d'abonnement premium offrant des avantages supplémentaires.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">2. Acceptation des conditions</h2>
          <p>
            En créant un compte sur Ngowamix ou en utilisant nos services, vous acceptez sans réserve l'ensemble des présentes Conditions Générales d'Utilisation (ci-après « CGU »). Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser nos services.
          </p>
          <p>
            Ngowamix se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles par notification sur la plateforme ou par email. L'utilisation continue du service après modification vaut acceptation des nouvelles conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">3. Création de compte</h2>
          <p>
            Pour accéder à la plupart des fonctionnalités, vous devez créer un compte en fournissant des informations exactes, complètes et à jour. Vous vous engagez à :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Fournir des informations vraies et non usurpées</li>
            <li>Maintenir la confidentialité de votre mot de passe</li>
            <li>Ne pas partager vos identifiants avec des tiers</li>
            <li>Nous informer immédiatement de toute utilisation non autorisée de votre compte</li>
          </ul>
          <p className="mt-2">
            Un seul compte est autorisé par personne. La création de comptes multiples peut entraîner la suspension de tous vos comptes.
          </p>
          <p>
            Ngowamix propose trois types de comptes :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Auditeur</strong> — Pour écouter, acheter et télécharger de la musique</li>
            <li><strong>Artiste</strong> — Pour publier et gérer vos propres œuvres musicales</li>
            <li><strong>Label / Producteur</strong> — Pour gérer le catalogue musical de plusieurs artistes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">4. Utilisation du service</h2>
          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">4.1 Pour les auditeurs</h3>
          <p>
            En tant qu'auditeur, vous pouvez écouter des extraits et titres en streaming gratuit, acheter des albums ou singles, télécharger vos achats pour écoute hors-ligne, et bénéficier d'un quota de téléchargements premium mensuel si vous êtes abonné.
          </p>
          <p>
            Les contenus achetés sont destinés à un usage strictement personnel. Il est interdit de :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Partager, distribuer ou vendre des contenus achetés à des tiers</li>
            <li>Utiliser les contenus à des fins commerciales</li>
            <li>Retirer les mentions de droits d'auteur ou de propriété</li>
            <li>Reproduire ou copier les fichiers audio</li>
          </ul>

          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">4.2 Pour les artistes et labels</h3>
          <p>
            En publiant du contenu sur Ngowamix, vous garantissez que :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Vous détenez tous les droits nécessaires sur les contenus publiés (musique, textes, images)</li>
            <li>Les contenus ne violent aucun droit de propriété intellectuelle d'un tiers</li>
            <li>Les contenus ne sont pas illicites, diffamatoires ou contraires aux bonnes mœurs</li>
            <li>Vous avez obtenu les autorisations nécessaires de tous les co-auteurs et ayants droit</li>
          </ul>
          <p className="mt-2">
            Ngowamix se réserve le droit de vérifier et valider chaque contenu avant sa publication. Le contenu soumis peut être refusé ou retiré s'il ne respecte pas nos directives.
          </p>

          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">4.3 Interdictions générales</h3>
          <p>
            Il est strictement interdit de :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Utiliser le service à des fins illégales ou frauduleuses</li>
            <li>Tenter de pirater, décompiler ou accéder de manière non autorisée à la plateforme</li>
            <li>Collecter des données personnelles d'autres utilisateurs</li>
            <li>Publier des contenus haineux, discriminatoires, violents ou pornographiques</li>
            <li>Utiliser des bots ou scripts automatisés pour interagir avec le service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">5. Propriété intellectuelle</h2>
          <p>
            Les contenus musicaux publiés sur Ngowamix restent la propriété exclusive de leurs créateurs (artistes, labels, producteurs). En publiant du contenu, vous accordez à Ngowamix une licence non exclusive pour :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Stocker, diffuser et distribuer vos contenus sur la plateforme</li>
            <li>Utiliser vos métadonnées (titre, image de couverture, biographie) à des fins de promotion</li>
            <li>Intégrer vos contenus dans les fonctionnalités du service (playlists, recommandations)</li>
          </ul>
          <p className="mt-2">
            L'interface, le code source, le design et la marque Ngowamix sont la propriété exclusive de Ngowamix et sont protégés par les lois sur la propriété intellectuelle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">6. Abonnements et paiements</h2>
          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">6.1 Abonnement premium</h3>
          <p>
            Ngowamix propose un abonnement premium donnant accès à des fonctionnalités supplémentaires (téléchargements illimités, écoute sans publicité, accès anticipé). L'abonnement est payable d'avance et se renouvelle automatiquement sauf résiliation par l'utilisateur.
          </p>
          <p>
            Vous pouvez résilier votre abonnement à tout moment depuis les paramètres de votre compte. La résiliation prendra effet à la fin de la période en cours. Aucun remboursement ne sera effectué pour la période restante.
          </p>

          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">6.2 Achats de contenus</h3>
          <p>
            Les albums et singles peuvent être achetés individuellement. Les paiements sont sécurisés et traités par des prestataires de paiement tiers (CinetPay, Stripe). Les prix sont affichés en Francs CFA (XOF) et sont TVA incluse.
          </p>
          <p>
            Les contenus numériques achetés ne sont ni repris ni remboursés, conformément à la réglementation sur les biens numériques.
          </p>

          <h3 className="text-base font-medium text-text-primary mt-4 mb-2">6.3 Billets de concert</h3>
          <p>
            Les billets de concert achetés via Ngowamix sont nominatifs et ne sont ni échangeables ni remboursables, sauf annulation de l'événement par l'organisateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">7. Rémunération des artistes et labels</h2>
          <p>
            Ngowamix reverse aux artistes et labels une part des revenus générés par leurs contenus selon les modalités définies dans un contrat séparé. Les revenus proviennent des ventes directes, des abonnements premium et d'autres sources de monétisation.
          </p>
          <p>
            Les paiements sont effectués selon la fréquence et les modalités convenues entre Ngowamix et le détenteur des droits. Ngowamix fournit un tableau de bord permettant de suivre les performances et les revenus de chaque contenu publié.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">8. Responsabilité</h2>
          <p>
            Ngowamix s'efforce d'assurer la disponibilité et la fiabilité du service mais ne garantit pas que le service fonctionnera sans interruption ou erreur. Ngowamix ne saurait être tenu responsable :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Des interruptions temporaires du service pour maintenance ou raisons techniques</li>
            <li>Des contenus publiés par les utilisateurs (artistes, labels)</li>
            <li>Des litiges entre artistes et labels concernant les droits d'auteur</li>
            <li>Des dommages indirects résultant de l'utilisation du service</li>
            <li>De la perte de données due à un problème technique ou à une négligence de l'utilisateur</li>
          </ul>
          <p className="mt-2">
            La responsabilité de Ngowamix est limitée au montant des sommes payées par l'utilisateur au cours des douze (12) derniers mois précédant le fait générateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">9. Protection des données personnelles</h2>
          <p>
            Ngowamix collecte et traite vos données personnelles conformément à sa Politique de Confidentialité disponible sur{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              ngowamix.com/privacy
            </Link>
            . En utilisant le service, vous consentez à ce traitement.
          </p>
          <p>
            Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Vous pouvez exercer ces droits en nous contactant à l'adresse indiquée en fin de document.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">10. Suspension et résiliation</h2>
          <p>
            Ngowamix peut suspendre ou résilier votre compte sans préavis en cas de :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Violation des présentes CGU</li>
            <li>Fraude ou tentative de fraude</li>
            <li>Publication de contenus illicites ou non autorisés</li>
            <li>Inactivité prolongée de votre compte (plus de 24 mois)</li>
          </ul>
          <p className="mt-2">
            En cas de résiliation, vos achats antérieurs restent accessibles pendant une période de 30 jours. Passé ce délai, l'accès aux contenus peut être suspendu.
          </p>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Cette action est irréversible et entraîne la perte définitive de vos données et contenus associés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">11. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont régies par le droit applicable dans le pays de résidence de Ngowamix. En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, le litige sera porté devant les tribunaux compétents.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-3">12. Contact</h2>
          <p>
            Pour toute question concernant ces conditions d'utilisation, vous pouvez nous contacter à :
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
