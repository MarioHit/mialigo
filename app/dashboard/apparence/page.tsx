"use client";

import PageThemeScope from "@/components/page-theme-scope";
import { supabaseClient } from "@/lib/supabase-auth";
import {
  ACCENT_PRESETS,
  DEFAULT_THEME,
  THEME_RADII,
  THEME_RADIUS_LABELS,
  THEME_STYLE_LABELS,
  THEME_STYLES,
  accentContrastWarning,
  isHexColor,
  type PageTheme,
} from "@/lib/themes";
import { useEffect, useState } from "react";
import { useDashboard } from "../dashboard-shell";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

const sameTheme = (a: PageTheme, b: PageTheme) =>
  a.style === b.style && a.accent === b.accent && a.radius === b.radius;

const sectionTitle =
  "block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300";

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
  const update = (changes: Partial<PageTheme>) => {
    const next = { ...theme, ...changes };
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

  const warning = accentContrastWarning(theme);
  const dirty = !sameTheme(theme, savedTheme);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Apparence de ma page
      </h2>

      {/* Style */}
      <fieldset>
        <legend className={sectionTitle}>Style</legend>
        <div className="grid grid-cols-2 gap-3">
          {THEME_STYLES.map((style) => {
            const selected = theme.style === style;
            return (
              <label
                key={style}
                className={`cursor-pointer rounded-xl border-2 p-2 transition-colors ${
                  selected
                    ? "border-indigo-600"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={style}
                  checked={selected}
                  onChange={() => update({ style })}
                  className="sr-only"
                />
                {/* Vignette : le vrai thème appliqué à une carte de lien. */}
                <PageThemeScope
                  theme={{ ...theme, style }}
                  className="rounded-lg p-3"
                >
                  <span
                    className="block-card block border px-3 py-2 text-center text-xs font-medium"
                    aria-hidden="true"
                  >
                    Mon lien
                  </span>
                </PageThemeScope>
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  {THEME_STYLE_LABELS[style].label}
                </span>
                <span className="block text-xs text-gray-500">
                  {THEME_STYLE_LABELS[style].description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Couleur d'accent */}
      <fieldset>
        <legend className={sectionTitle}>Couleur d’accent</legend>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_PRESETS.map((color) => {
            const selected = theme.accent === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => update({ accent: color })}
                aria-label={`Couleur ${color}`}
                aria-pressed={selected}
                className={`h-9 w-9 rounded-full border-2 transition-transform hover:scale-110 ${
                  selected
                    ? "border-gray-900 dark:border-white scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
          <label className="ml-1 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="color"
              value={theme.accent}
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                if (isHexColor(value)) update({ accent: value });
              }}
              className="h-9 w-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent"
            />
            Autre couleur
          </label>
        </div>
        {warning && (
          <p
            role="status"
            className="mt-3 text-sm text-amber-700 dark:text-amber-400"
          >
            ⚠️ {warning}
          </p>
        )}
      </fieldset>

      {/* Arrondis */}
      <fieldset>
        <legend className={sectionTitle}>Arrondis des blocs</legend>
        <div className="flex flex-wrap gap-2">
          {THEME_RADII.map((radius) => {
            const selected = theme.radius === radius;
            return (
              <label
                key={radius}
                className={`cursor-pointer rounded-lg border-2 px-3 py-2 text-sm transition-colors ${
                  selected
                    ? "border-indigo-600 text-indigo-700 dark:text-indigo-300"
                    : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="radius"
                  value={radius}
                  checked={selected}
                  onChange={() => update({ radius })}
                  className="sr-only"
                />
                {THEME_RADIUS_LABELS[radius]}
              </label>
            );
          })}
        </div>
      </fieldset>

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
