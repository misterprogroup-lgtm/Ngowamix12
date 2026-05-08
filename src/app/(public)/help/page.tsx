export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Aide & Support</h1>
      <div className="space-y-6 text-text-secondary">
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Comment écouter de la musique ?</h2>
          <p>Parcourez le catalogue, cliquez sur un artiste ou un album, puis appuyez sur le bouton Play. Le lecteur audio apparaîtra en bas de l&apos;écran.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Comment passer Premium ?</h2>
          <p>Rendez-vous sur la page Premium, choisissez votre mode de paiement (Mobile Money ou carte bancaire) et validez. L&apos;accès est immédiat.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Comment acheter un album ?</h2>
          <p>Sur la page de l&apos;album, cliquez sur &quot;Acheter&quot;, choisissez votre moyen de paiement et validez. L&apos;album sera ajouté à votre bibliothèque.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Téléchargements Premium</h2>
          <p>Les abonnés Premium peuvent télécharger jusqu&apos;à 30 titres par mois. Le compteur est réinitialisé à chaque cycle mensuel.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Contact</h2>
          <p>Pour toute question, utilisez la page <a href="/contact" className="text-primary hover:underline">Contact</a> ou écrivez à support@ngowamix.com</p>
        </section>
      </div>
    </div>
  );
}
