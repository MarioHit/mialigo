"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const lower = path.toLowerCase();

      // Si l'URL contient des majuscules, rediriger vers la version minuscule
      if (path !== lower) {
        setIsRedirecting(true);
        window.location.replace(lower);
      }
    }
  }, []);

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
          Désolé, cette page n'existe pas ou l'utilisateur n'a pas encore créé
          son profil.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
