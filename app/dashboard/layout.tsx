import type { Metadata } from "next";
import DashboardShell from "./dashboard-shell";

// Page privée : jamais indexée (les composants client ne peuvent pas exporter de metadata).
export const metadata: Metadata = {
  title: "Tableau de bord - Mialigo",
  robots: { index: false, follow: false },
};

// Layout commun aux sous-pages : vérification de session, en-tête et navigation
// (DashboardShell, composant client).
export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
