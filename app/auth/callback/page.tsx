"use client";

import { supabaseClient } from "@/lib/supabase-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const exchange = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("Lien invalide ou expiré.");
        return;
      }

      const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

      if (error) {
        setError(error.message);
        return;
      }

      router.replace("/dashboard");
    };

    exchange();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <a href="/login" className="text-indigo-600 hover:underline">
              Retour à la connexion
            </a>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Connexion en cours...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
