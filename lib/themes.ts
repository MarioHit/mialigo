// Thèmes de page (#19) : style, couleur d'accent et arrondis, stockés dans
// users.theme. Listes à garder synchronisées avec la contrainte users_theme_check
// (supabase-themes.sql). Le rendu est en CSS (app/globals.css, [data-page-style]).

import type { CSSProperties } from "react";

export const THEME_STYLES = ["classic", "glass", "minimal", "neon"] as const;
export type ThemeStyle = (typeof THEME_STYLES)[number];

export const THEME_RADII = ["none", "soft", "strong", "pill"] as const;
export type ThemeRadius = (typeof THEME_RADII)[number];

export interface PageTheme {
  style: ThemeStyle;
  /** Couleur d'accent, au format #rrggbb. */
  accent: string;
  radius: ThemeRadius;
}

/** Thème appliqué quand users.theme est NULL : l'apparence d'avant les thèmes. */
export const DEFAULT_THEME: PageTheme = {
  style: "classic",
  accent: "#6366f1",
  radius: "pill",
};

/** Deux thèmes identiques (style, accent, arrondi). */
export function sameTheme(a: PageTheme, b: PageTheme): boolean {
  return a.style === b.style && a.accent === b.accent && a.radius === b.radius;
}

export const THEME_STYLE_LABELS: Record<
  ThemeStyle,
  { label: string; description: string }
> = {
  classic: {
    label: "Classique",
    description: "Sobre, suit le mode clair ou sombre du visiteur.",
  },
  glass: {
    label: "Verre",
    description: "Fond dégradé de votre couleur, cartes translucides.",
  },
  minimal: {
    label: "Minimal",
    description: "Noir et blanc, cartes à simple contour.",
  },
  neon: {
    label: "Néon",
    description: "Fond sombre, contours lumineux. Toujours sombre.",
  },
};

export const THEME_RADIUS_LABELS: Record<ThemeRadius, string> = {
  none: "Aucun",
  soft: "Léger",
  strong: "Fort",
  pill: "Pilule",
};

/** Valeur CSS de --block-radius. */
const RADIUS_VALUES: Record<ThemeRadius, string> = {
  none: "0px",
  soft: "0.5rem",
  strong: "1.25rem",
  pill: "9999px",
};

/**
 * Couleurs d'accent proposées (la couleur reste libre). Toutes gardent un
 * contraste d'au moins 3:1 sur les fonds clairs et sombres des thèmes
 * Classique, Minimal et Néon : aucune ne déclenche l'avertissement.
 */
export const ACCENT_PRESETS = [
  "#6366f1", // indigo (défaut)
  "#0284c7", // bleu ciel
  "#0d9488", // sarcelle
  "#16a34a", // vert
  "#ea580c", // orange
  "#ef4444", // rouge
  "#ec4899", // rose
  "#a855f7", // violet
] as const;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

/** Lit users.theme ; toute valeur absente ou invalide prend la valeur par défaut. */
export function parseTheme(value: unknown): PageTheme {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return DEFAULT_THEME;
  }
  const raw = value as Record<string, unknown>;
  return {
    style: THEME_STYLES.includes(raw.style as ThemeStyle)
      ? (raw.style as ThemeStyle)
      : DEFAULT_THEME.style,
    accent: isHexColor(raw.accent)
      ? raw.accent.toLowerCase()
      : DEFAULT_THEME.accent,
    radius: THEME_RADII.includes(raw.radius as ThemeRadius)
      ? (raw.radius as ThemeRadius)
      : DEFAULT_THEME.radius,
  };
}

// --- Contraste (WCAG 2.x) ---

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** Rapport de contraste entre deux couleurs #rrggbb (1 à 21). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** Texte lisible (noir ou blanc) posé sur la couleur d'accent. */
export function readableTextOn(hex: string): string {
  return contrastRatio(hex, "#000000") >= contrastRatio(hex, "#ffffff")
    ? "#000000"
    : "#ffffff";
}

/**
 * Fonds sur lesquels l'accent sert de contour ou de lueur, en mode clair et
 * sombre (mêmes valeurs que app/globals.css). Le style « Verre » colore son fond
 * avec l'accent lui-même : pas de contrôle.
 */
const ACCENT_BACKGROUNDS: Partial<Record<ThemeStyle, string[]>> = {
  classic: ["#f4f4f9", "#121212"],
  minimal: ["#ffffff", "#000000"],
  neon: ["#07070d"],
};

/** Contraste minimal pour un élément graphique (WCAG 1.4.11). */
const MIN_ACCENT_CONTRAST = 3;

/** Message si l'accent se distingue mal du fond (dans un des modes), sinon null. */
export function accentContrastWarning(theme: PageTheme): string | null {
  const backgrounds = ACCENT_BACKGROUNDS[theme.style];
  if (!backgrounds) return null;
  const worst = Math.min(
    ...backgrounds.map((bg) => contrastRatio(theme.accent, bg)),
  );
  if (worst >= MIN_ACCENT_CONTRAST) return null;
  return backgrounds.length > 1
    ? "Cette couleur se distingue mal du fond en mode clair ou sombre : les contours et le survol des blocs seront peu visibles."
    : "Cette couleur se distingue mal du fond sombre : les contours lumineux seront peu visibles.";
}

/** Attributs du conteneur qui applique le thème (page publique, aperçu). */
export function themeScopeProps(theme: PageTheme): {
  "data-page-style": ThemeStyle;
  style: CSSProperties;
} {
  return {
    "data-page-style": theme.style,
    style: {
      "--accent": theme.accent,
      "--accent-contrast": readableTextOn(theme.accent),
      "--block-radius": RADIUS_VALUES[theme.radius],
    } as CSSProperties,
  };
}
