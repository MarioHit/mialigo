"use client";

import { supabaseClient } from "@/lib/supabase-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      if (cleanUsername.length > 0 && cleanUsername.length < 3) {
        console.log(
          `[Signup] Pseudo trop court (< 3 caractères): "${cleanUsername}"`,
        );
      }
      setUsernameStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      console.log(
        `[Signup] 🔍 Vérification de la disponibilité du pseudo: "${cleanUsername}"`,
      );
      try {
        const { data, error } = await supabaseClient
          .from("users")
          .select("username")
          .eq("username", cleanUsername)
          .maybeSingle();

        if (error) {
          console.error(
            `[Signup] ❌ Erreur lors de la vérification du pseudo "${cleanUsername}":`,
            error.message,
          );
          setUsernameStatus("idle");
          return;
        }

        if (data) {
          console.warn(
            `[Signup] ⚠️ Pseudo "${cleanUsername}" DÉJÀ PRIS en base de données.`,
          );
          setUsernameStatus("taken");
        } else {
          console.log(`[Signup] ✅ Pseudo "${cleanUsername}" DISPONIBLE.`);
          setUsernameStatus("available");
        }
      } catch (err: any) {
        console.error(`[Signup] ❌ Exception vérification pseudo:`, err);
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleUsernameChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(cleaned);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanUsername = username.trim().toLowerCase();
    const cleanName = name.trim() || cleanUsername;
    const cleanEmail = email.trim();

    console.log(`[Signup] 🚀 Tentative d'inscription:`, {
      email: cleanEmail,
      username: cleanUsername,
      name: cleanName,
      usernameStatus,
    });

    if (cleanUsername.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
      console.warn(`[Signup] Échec validation: pseudo trop court.`);
      return;
    }

    if (usernameStatus === "taken") {
      setError("Ce nom d'utilisateur est déjà réservé.");
      console.warn(`[Signup] Échec validation: pseudo déjà réservé.`);
      return;
    }

    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
      console.log(
        `[Signup] Envoi du magic link via Supabase signInWithOtp (redirectTo: ${redirectTo})...`,
      );

      const { error: signupError } = await supabaseClient.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
          data: {
            username: cleanUsername,
            name: cleanName,
          },
        },
      });

      if (signupError) throw signupError;

      console.log(
        `[Signup] ✅ Magic link d'inscription envoyé avec succès à: "${cleanEmail}"`,
      );
      setMessage(
        `🎉 Lien de confirmation envoyé à ${cleanEmail} ! Cliquez sur le lien dans votre email pour activer votre page (vous pouvez l'ouvrir depuis n'importe quel navigateur ou smartphone).`,
      );
    } catch (err: any) {
      console.error(
        `[Signup] ❌ Erreur lors de l'envoi du magic link d'inscription:`,
        err,
      );
      setError(err.message || "Erreur lors de l'inscription.");
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
            Créez votre page en 1 minute
          </p>
        </div>

        {/* Carte du formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-2 text-center text-gray-900 dark:text-white">
            Créer un compte
          </h2>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-6">
            Choisissez votre lien unique et commencez gratuitement
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Choix du pseudo / URL */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Votre URL Mialigo
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="px-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 py-3 select-none">
                  mialigo.com/
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="votre-pseudo"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  className="w-full px-3 py-3 bg-transparent text-gray-900 dark:text-white focus:outline-none text-sm"
                />
              </div>

              {/* Indicateur disponibilité */}
              <div className="mt-1.5 text-xs">
                {usernameStatus === "checking" && (
                  <span className="text-gray-500">
                    Vérification de la disponibilité...
                  </span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ mialigo.com/{username} est disponible !
                  </span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    ✗ Ce nom est déjà pris
                  </span>
                )}
                {usernameStatus === "idle" &&
                  username.length > 0 &&
                  username.length < 3 && (
                    <span className="text-gray-400">
                      Au moins 3 caractères (lettres, chiffres, tirets)
                    </span>
                  )}
              </div>
            </div>

            {/* Nom complet */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nom complet / Titre de votre page
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ex : Mario Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* Email */}
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
              disabled={
                loading || usernameStatus === "taken" || username.length < 3
              }
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Envoi du lien..." : "✨ Créer mon compte"}
            </button>
          </form>

          {/* Messages d'état */}
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

          {/* Lien vers connexion */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            Vous avez déjà un compte ?{" "}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Se connecter
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
