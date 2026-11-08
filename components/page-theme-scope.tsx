import { themeScopeProps, type PageTheme } from "@/lib/themes";
import type { ReactNode } from "react";

/**
 * Conteneur qui applique un thème de page (#19) : fond, couleurs, accent et
 * arrondis (variables CSS de app/globals.css). Utilisé par la page publique et
 * par l'aperçu du dashboard, pour un rendu identique.
 */
export default function PageThemeScope({
  theme,
  className = "",
  inert,
  children,
}: {
  theme: PageTheme;
  className?: string;
  /** Aperçu : on le regarde, ses liens ne s'ouvrent pas. */
  inert?: boolean;
  children: ReactNode;
}) {
  const { style, ...attributes } = themeScopeProps(theme);
  return (
    <div
      {...attributes}
      style={style}
      inert={inert}
      className={`page-theme ${className}`}
    >
      {children}
    </div>
  );
}
