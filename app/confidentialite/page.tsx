import LegalPage from "@/app/legal-page";

export const metadata = {
  title: "Politique de confidentialité - Mialigo",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      intro="Cette page explique quelles données Mialigo utilise pour fournir son service."
    >
      <h2>Données utilisées</h2>
      <p>
        Mialigo peut enregistrer les données nécessaires au fonctionnement du
        compte :
      </p>
      <ul>
        <li>l'adresse email utilisée pour la connexion par lien magique ;</li>
        <li>le nom d'utilisateur et le nom affiché ;</li>
        <li>la biographie et les liens ajoutés à la page publique ;</li>
        <li>les icônes choisies pour ces liens.</li>
      </ul>

      <h2>Utilisation des données</h2>
      <p>
        Ces données servent à créer, sécuriser et afficher la page de liens de
        l'utilisateur. Elles ne doivent pas être utilisées pour une finalité
        différente sans information préalable.
      </p>

      <h2>Services utilisés</h2>
      <p>
        L'authentification et le stockage des données utilisent Supabase. Le
        déploiement du site utilise Vercel. Ces services peuvent traiter des
        données selon leurs propres politiques de confidentialité.
      </p>

      <h2>Pages publiques</h2>
      <p>
        Le nom affiché, la biographie et les liens publiés sont visibles par les
        visiteurs de la page utilisateur. N'ajoutez pas d'information que vous
        souhaitez garder privée.
      </p>

      <h2>Vos droits</h2>
      <p>
        Pour demander l'accès, la correction ou la suppression de vos données,
        utilisez la page <a href="/contact">Contact</a> ou la page
        <a href="/suppression-compte"> Suppression du compte</a>.
      </p>

      <p className="text-sm">
        Dernière mise à jour : 29 août 2026. Cette page est adaptée aux
        traitements réellement effectués par Mialigo dans son fonctionnement
        actuel.
      </p>
    </LegalPage>
  );
}
