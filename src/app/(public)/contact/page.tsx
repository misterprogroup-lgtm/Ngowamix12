export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>
      <div className="space-y-4 text-text-secondary">
        <p>Pour toute question ou demande d&apos;information, contactez-nous :</p>
        <ul className="space-y-2">
          <li>Email : support@ngowamix.com</li>
          <li>Disponible du lundi au vendredi, 9h-18h</li>
        </ul>
        <p className="text-sm text-text-muted">
          Pour les artistes souhaitant rejoindre la plateforme, envoyez votre demande à artistes@ngowamix.com
        </p>
      </div>
    </div>
  );
}
