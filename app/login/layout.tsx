import type { Metadata } from "next";

// Page privée : jamais indexée (les composants client ne peuvent pas exporter de metadata).
export const metadata: Metadata = {
  title: "Connexion - Mialigo",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return children;
}
