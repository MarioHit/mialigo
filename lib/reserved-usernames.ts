// Pseudos interdits : ils entreraient en conflit avec une route du site
// (Next.js sert la page statique avant app/[username]), une route future,
// ou pourraient passer pour un compte officiel.
//
// ⚠️ Liste dupliquée dans la fonction SQL public.is_reserved_username
// (supabase-reserved-usernames.sql / supabase-auth-clean.sql), qui bloque aussi côté base :
// garder les deux synchronisées.
// Toute nouvelle page à la racine de app/ doit être ajoutée ici.
export const reservedUsernames = new Set([
  // Routes existantes
  "auth",
  "cgu",
  "confidentialite",
  "contact",
  "dashboard",
  "login",
  "mentions-legales",
  "signup",
  "suppression-compte",
  // Routes techniques Next.js / futures
  "_next",
  "api",
  "aide",
  "help",
  "tarifs",
  "pricing",
  "blog",
  "settings",
  "parametres",
  "logout",
  "register",
  "inscription",
  "connexion",
  // Comptes pouvant passer pour officiels
  "admin",
  "administrateur",
  "mialigo",
  "support",
  "root",
  "staff",
]);

export function isReservedUsername(username: string) {
  return reservedUsernames.has(username.trim().toLowerCase());
}
