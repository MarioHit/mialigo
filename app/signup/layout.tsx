import type { Metadata } from "next";

// Page privée : jamais indexée (les composants client ne peuvent pas exporter de metadata).
export const metadata: Metadata = {
  title: "Créer ma page - Mialigo",
  robots: { index: false, follow: true },
};

export default function SignupLayout({ children }: LayoutProps<"/signup">) {
  return children;
}
