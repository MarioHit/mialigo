import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

export const metadata: Metadata = {
  title: "Mialigo - Tous vos liens au même endroit",
  description:
    "Créez votre page personnalisée et partagez tous vos liens au même endroit avec Mialigo.",
  keywords: [
    "Mialigo",
    "page de liens",
    "liens sociaux",
    "profil personnalisé",
    "réseaux sociaux",
  ],
  authors: [{ name: "Mialigo" }],
  openGraph: {
    title: "Mialigo - Tous vos liens au même endroit",
    description:
      "Créez votre page personnalisée et partagez tous vos liens au même endroit avec Mialigo.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
