import LegalPage from "@/app/legal-page";
import Link from "next/link";

export const metadata = {
  title: "Politique de confidentialité - Mialigo",
  alternates: { canonical: "/confidentialite" },
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
        <li>l’adresse e-mail utilisée pour la connexion par lien reçu ;</li>
        <li>le nom d’utilisateur et le nom affiché ;</li>
        <li>la biographie et les liens ajoutés à la page publique ;</li>
        <li>les icônes choisies pour ces liens ;</li>
        <li>
          la photo de profil et la bannière, si l’utilisateur en ajoute une.
        </li>
      </ul>

      <h2>Utilisation des données</h2>
      <p>
        Ces données servent à créer, sécuriser et afficher la page de liens de
        l’utilisateur. Elles ne doivent pas être utilisées pour une finalité
        différente sans information préalable.
      </p>

      <h2>Services utilisés</h2>
      <p>
        L’authentification et le stockage des données utilisent Supabase. Le
        déploiement du site utilise Vercel. Ces services peuvent traiter des
        données selon leurs propres politiques de confidentialité.
      </p>
      <p>
        Si l’utilisateur importe sa photo depuis Gravatar, une empreinte de son
        adresse e-mail est transmise à Gravatar pour retrouver l’image ; s’il
        l’importe depuis GitHub, seul le pseudo GitHub saisi est utilisé. Dans
        les deux cas, l’image est copiée sur Mialigo : les visiteurs de la page
        ne contactent ni Gravatar ni GitHub.
      </p>

      <h2>Pages publiques</h2>
      <p>
        Le nom affiché, la photo de profil, la bannière, la biographie et les
        liens publiés sont visibles par les visiteurs de la page utilisateur.
        N’ajoutez pas d’information que vous souhaitez garder privée.
      </p>

      <h2>Vos droits</h2>
      <p>
        Pour demander l’accès, la correction ou la suppression de vos données,
        utilisez la page <Link href="/contact">Contact</Link> ou la page
        <Link href="/suppression-compte"> Suppression du compte</Link>.
      </p>

      <p className="text-sm">
        Dernière mise à jour : 29 août 2026. Cette page est adaptée aux
        traitements réellement effectués par Mialigo dans son fonctionnement
        actuel.
      </p>
    </LegalPage>
  );
}
