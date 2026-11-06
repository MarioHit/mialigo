// Domaine canonique : toutes les URL publiées aux moteurs (canonique, sitemap, Open Graph)
// pointent ici, quel que soit le domaine qui sert la page (mialigo.com, pp.mialigo.com, *.vercel.app).
export const siteUrl = "https://www.mialigo.com";

export const siteName = "Mialigo";

export const defaultDescription =
  "Créez votre page personnalisée et partagez tous vos liens au même endroit avec Mialigo.";

// Seule la production Vercel doit être indexée. Préprod (pp.mialigo.com), previews de branche
// et local : VERCEL_ENV vaut "preview", "development" ou est absent.
export const isIndexable = process.env.VERCEL_ENV === "production";
