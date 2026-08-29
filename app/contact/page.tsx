import LegalPage from "@/app/legal-page";

export const metadata = {
  title: "Contact - Mialigo",
};

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact"
      intro="Une question, un problème ou une demande concernant une page Mialigo ?"
    >
      <h2>Nous contacter</h2>
      <p>Écris-nous à l'adresse suivante :</p>
      <p>
        <a
          href="mailto:contact-1@mailigo.com"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          contact-1@mailigo.com
        </a>
      </p>

      <h2>Demande de suppression</h2>
      <p>
        Pour supprimer ton compte et tes données, indique dans ton message
        l'adresse email associée au compte. Consulte aussi la page
        <a href="/suppression-compte"> Suppression du compte</a>.
      </p>

      <h2>Signalement</h2>
      <p>
        Pour signaler un lien ou une page qui enfreint les règles de Mialigo,
        joins l'adresse de la page et explique précisément le motif du
        signalement.
      </p>
    </LegalPage>
  );
}
