"use client";

import ThemePicker from "@/components/theme-picker";
import { supabaseClient } from "@/lib/supabase-auth";
import { DEFAULT_THEME, sameTheme, type PageTheme } from "@/lib/themes";
import { useEffect, useState } from "react";
import { useDashboard } from "../dashboard-shell";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

export default function ApparencePage() {
  const { user, profile, reloadProfile, setThemeDraft } = useDashboard();
  const savedTheme = profile?.theme ?? DEFAULT_THEME;
  const [theme, setTheme] = useState<PageTheme>(savedTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  // Le brouillon de l'aperçu disparaît quand on quitte la page sans enregistrer.
  useEffect(() => () => setThemeDraft(null), [setThemeDraft]);

  if (!profile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enregistrez d’abord votre profil pour choisir l’apparence de votre
          page.
        </p>
      </div>
    );
  }

  /** Met à jour le choix et l'aperçu en direct (rien n'est enregistré). */
  const update = (next: PageTheme) => {
    setTheme(next);
    setThemeDraft(next);
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    debug("[Dashboard] Enregistrement du thème.");
    // Thème par défaut : NULL, la page garde l'apparence standard.
    const value = sameTheme(theme, DEFAULT_THEME) ? null : theme;
    const { error } = await supabaseClient
      .from("users")
      .update({ theme: value, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      console.error("[Dashboard] Échec de l'enregistrement du thème.");
      setMessage({ type: "error", text: "Erreur : " + error.message });
    } else {
      debug("[Dashboard] Thème enregistré.");
      await reloadProfile();
      setThemeDraft(null);
      setMessage({ type: "ok", text: "Apparence enregistrée." });
    }
    setSaving(false);
  };

  const dirty = !sameTheme(theme, savedTheme);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Apparence de ma page
      </h2>

      <ThemePicker theme={theme} onChange={update} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "💾 Enregistrer"}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => {
              setTheme(savedTheme);
              setThemeDraft(null);
              setMessage(null);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
        )}
        {!sameTheme(theme, DEFAULT_THEME) && (
          <button
            type="button"
            onClick={() => update(DEFAULT_THEME)}
            className="text-sm text-gray-600 dark:text-gray-400 underline"
          >
            Revenir au thème par défaut
          </button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm ${
            message.type === "ok"
              ? "text-green-700 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
