"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

// L'URL ne change pas tant que la page est affichée : rien à écouter.
const subscribe = () => () => {};
const hasUppercase = () =>
  window.location.pathname !== window.location.pathname.toLowerCase();

export default function NotFound() {
  // false côté serveur et à l'hydratation, puis la vraie valeur côté client.
  const isRedirecting = useSyncExternalStore(subscribe, hasUppercase, () => false);

  useEffect(() => {
    // Si l'URL contient des majuscules, rediriger vers la version minuscule
    if (isRedirecting) {
      window.location.replace(window.location.pathname.toLowerCase());
    }
  }, [isRedirecting]);

  // Évite de faire clignoter le texte 404 pendant la redirection
  if (isRedirecting) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page introuvable</h2>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Désolé, cette page n’existe pas ou l’utilisateur n’a pas encore créé
          son profil.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
