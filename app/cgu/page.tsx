import LegalPage from "@/app/legal-page";

export const metadata = {
  title: "Conditions générales d'utilisation - Mialigo",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      intro="Les règles essentielles pour utiliser Mialigo et publier une page de liens."
    >
      <h2>Objet du service</h2>
      <p>
        Mialigo permet de créer une page publique regroupant des liens choisis
        par l'utilisateur.
      </p>

      <h2>Responsabilité de l'utilisateur</h2>
      <p>
        L'utilisateur est responsable des informations et des liens qu'il
        publie. Il doit disposer des droits nécessaires sur les contenus
        utilisés et respecter les lois applicables.
      </p>

      <h2>Usages interdits</h2>
      <p>
        Il est interdit d'utiliser Mialigo pour publier du contenu illégal,
        frauduleux, malveillant, trompeur ou portant atteinte aux droits
        d'autrui.
      </p>

      <h2>Liens externes</h2>
      <p>
        Les liens présents sur les pages publiques renvoient vers des services
        tiers. Mialigo ne contrôle pas leur contenu, leur disponibilité ou leurs
        conditions d'utilisation.
      </p>

      <h2>Suspension d'un compte</h2>
      <p>
        Mialigo peut suspendre ou supprimer une page qui enfreint ces règles ou
        la loi applicable, dans les conditions prévues par la réglementation.
      </p>

      <h2>Évolution du service</h2>
      <p>
        Le service peut évoluer pour améliorer ses fonctionnalités, sa sécurité
        ou sa disponibilité. Les présentes conditions peuvent également être
        mises à jour.
      </p>
    </LegalPage>
  );
}
