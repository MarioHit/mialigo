"use client";

import { supabaseClient } from "@/lib/supabase-auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      console.warn(`[Login] ⚠️ Paramètre d'erreur URL reçu: "${errorParam}"`);
      setError(errorParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUser = async () => {
      console.log(`[Login] 🔍 Vérification de la session active...`);
      const { data } = await supabaseClient.auth.getSession();
      if (data.session) {
        console.log(
          `[Login] ✅ Session existante détectée pour ${data.session.user.email} -> redirection /dashboard`,
        );
        router.push("/dashboard");
      } else {
        console.log(`[Login] Aucune session active.`);
      }
    };
    checkUser();
  }, [router]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const cleanEmail = email.trim();
    console.log(
      `[Login] 🚀 Demande de lien magique pour l'email: "${cleanEmail}"`,
    );

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      console.log(
        `[Login] Appel Supabase signInWithOtp (shouldCreateUser: false, redirectTo: ${redirectTo})...`,
      );

      const { error: otpError } = await supabaseClient.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: redirectTo,
        },
      });

      if (otpError) {
        console.warn(
          `[Login] ⚠️ Erreur Supabase signInWithOtp:`,
          otpError.message,
        );
        if (
          otpError.message.includes("Signups not allowed") ||
          otpError.message.toLowerCase().includes("user not found")
        ) {
          throw new Error(
            "Aucun compte associé à cet email. Veuillez d'abord créer un compte.",
          );
        }
        throw otpError;
      }

      console.log(
        `[Login] ✅ Magic link de connexion envoyé avec succès à "${cleanEmail}"`,
      );
      setMessage(
        "🎉 Lien de connexion envoyé ! Cliquez sur le lien dans votre boîte email (ouvrez-le depuis n'importe quel navigateur ou appareil).",
      );
      setEmail("");
    } catch (err: any) {
      console.error(`[Login] ❌ Échec envoi magic link:`, err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        {/* Logo / Titre */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mialigo
            </h1>
          </Link>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Votre page de liens en un clic
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900 dark:text-white">
            Créer un compte ou se connecter
          </h2>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
            Saisissez votre adresse e-mail. Nous vous enverrons un lien pour
            accéder à votre compte.
          </p>

          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                placeholder="votreemail@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi du lien..." : "Recevoir mon lien de connexion"}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-xs text-green-800 dark:text-green-200">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Information de connexion */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              🔐 <strong>Sans mot de passe :</strong> Cliquez sur le lien reçu
              dans votre email pour vous connecter instantanément.
            </p>
          </div>

          {/* Lien vers inscription */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Créer ma page gratuitement
            </Link>
          </div>
        </div>

        {/* Lien retour */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
