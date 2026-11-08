"use client";

// Choix du thème de page (#19) : style, couleur d'accent, arrondis.
// Partagé par l'onglet « Apparence » du dashboard et le mode « Personnaliser »
// de la page publique ; ne fait qu'appeler onChange (rien n'est enregistré).

import PageThemeScope from "@/components/page-theme-scope";
import {
  ACCENT_PRESETS,
  THEME_RADII,
  THEME_RADIUS_LABELS,
  THEME_STYLE_LABELS,
  THEME_STYLES,
  accentContrastWarning,
  isHexColor,
  type PageTheme,
} from "@/lib/themes";
import { useId } from "react";

export default function ThemePicker({
  theme,
  onChange,
  compact = false,
}: {
  theme: PageTheme;
  onChange: (theme: PageTheme) => void;
  /** Version resserrée (panneau en bas de la page publique, mobile). */
  compact?: boolean;
}) {
  // Noms des groupes radio uniques : deux sélecteurs peuvent coexister.
  const id = useId();
  const update = (changes: Partial<PageTheme>) =>
    onChange({ ...theme, ...changes });
  const warning = accentContrastWarning(theme);
  const sectionTitle = `block text-sm font-medium text-gray-700 dark:text-gray-300 ${
    compact ? "mb-2" : "mb-3"
  }`;

  return (
    <div className={compact ? "space-y-5" : "space-y-8"}>
      {/* Style */}
      <fieldset>
        <legend className={sectionTitle}>Style</legend>
        <div
          className={
            compact ? "grid grid-cols-4 gap-2" : "grid grid-cols-2 gap-3"
          }
        >
          {THEME_STYLES.map((style) => {
            const selected = theme.style === style;
            return (
              <label
                key={style}
                className={`cursor-pointer rounded-xl border-2 transition-colors ${compact ? "p-1" : "p-2"} ${
                  selected
                    ? "border-indigo-600"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-style`}
                  value={style}
                  checked={selected}
                  onChange={() => update({ style })}
                  className="sr-only"
                />
                {/* Vignette : le vrai thème appliqué à une carte de lien. */}
                <PageThemeScope
                  theme={{ ...theme, style }}
                  className={`rounded-lg ${compact ? "p-1.5" : "p-3"}`}
                >
                  <span
                    className={`block-card block border text-center font-medium ${compact ? "px-1 py-1 text-[10px]" : "px-3 py-2 text-xs"}`}
                    aria-hidden="true"
                  >
                    {compact ? "Lien" : "Mon lien"}
                  </span>
                </PageThemeScope>
                <span
                  className={`block font-medium text-gray-900 dark:text-white ${compact ? "mt-1 text-center text-xs" : "mt-2 text-sm"}`}
                >
                  {THEME_STYLE_LABELS[style].label}
                </span>
                {!compact && (
                  <span className="block text-xs text-gray-500">
                    {THEME_STYLE_LABELS[style].description}
                  </span>
                )}
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
                  name={`${id}-radius`}
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
    </div>
  );
}
