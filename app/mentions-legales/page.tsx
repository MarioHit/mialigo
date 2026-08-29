import LegalPage from "@/app/legal-page";

export const metadata = {
  title: "Mentions légales - Mialigo",
};

export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Mentions légales"
      intro="Informations relatives à l'éditeur et à l'hébergement de Mialigo."
    >
      <h2>Éditeur du site</h2>
      <p>
        Mialigo est édité par <strong>Mario</strong>.
      </p>
      <p>
        Adresse : <strong>Nantes</strong>
        <br />
        Email : <strong>contact-1@mailigo.com</strong>
      </p>

      <h2>Directeur de la publication</h2>
      <p>
        Directeur de la publication : <strong>Mario</strong>.
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA
        91789, États-Unis.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question concernant le site, contactez l'éditeur à l'adresse
        indiquée ci-dessus.
      </p>
    </LegalPage>
  );
}
