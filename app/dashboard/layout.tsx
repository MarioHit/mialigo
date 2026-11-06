import type { Metadata } from "next";

// Page privée : jamais indexée (les composants client ne peuvent pas exporter de metadata).
export const metadata: Metadata = {
  title: "Tableau de bord - Mialigo",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return children;
}
