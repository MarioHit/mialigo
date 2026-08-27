"use client";

import { supabaseClient } from "@/lib/supabase-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;

        if (data.session) {
          router.replace("/dashboard");
        } else {
          // Attendre un court instant si la session s'établit via l'URL hash/code
          const { data: authListener } = supabaseClient.auth.onAuthStateChange(
            (event, session) => {
              if (session) {
                router.replace("/dashboard");
              }
            },
          );

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        setError(err.message || "Erreur lors de la connexion");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <div>
            <p className="text-red-500 mb-4">{error}</p>
            <a
              href="/login"
              className="text-indigo-600 hover:underline text-sm"
            >
              Retour à la page de connexion
            </a>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Connexion en cours...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
