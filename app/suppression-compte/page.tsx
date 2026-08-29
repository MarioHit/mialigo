import LegalPage from "@/app/legal-page";

export const metadata = {
  title: "Suppression du compte - Mialigo",
};

export default function DeleteAccountPage() {
  return (
    <LegalPage
      title="Suppression du compte"
      intro="Tu peux demander la suppression de ton compte et des données associées."
    >
      <h2>Comment faire la demande</h2>
      <ol>
        <li>
          Envoie un email à <strong>contact-1@mailigo.com</strong>.
        </li>
        <li>Utilise l'adresse email associée à ton compte Mialigo.</li>
        <li>
          Indique clairement que tu demandes la suppression de ton compte.
        </li>
      </ol>

      <h2>Données concernées</h2>
      <p>
        La demande concerne le compte, le profil utilisateur et les liens qui
        lui sont associés, sous réserve des obligations légales de conservation.
      </p>

      <h2>Délai de traitement</h2>
      <p>
        Une confirmation sera envoyée après vérification de la demande et
        traitement de la suppression.
      </p>

      <p className="text-sm">
        Cette page décrit la procédure actuellement prévue. Elle devra être
        alignée avec la procédure technique réellement disponible avant la mise
        en production.
      </p>
    </LegalPage>
  );
}
