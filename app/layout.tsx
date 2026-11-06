import { defaultDescription, isIndexable, siteName, siteUrl } from "@/lib/site";
import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "./theme-toggle";

export const metadata: Metadata = {
  // Base des URL relatives (canonique, Open Graph) : toujours le domaine de production.
  metadataBase: new URL(siteUrl),
  title: "Mialigo - Tous vos liens au même endroit",
  description: defaultDescription,
  // Préprod, previews et local ne doivent jamais être indexés.
  robots: isIndexable ? undefined : { index: false, follow: false },
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
    description: defaultDescription,
    type: "website",
    siteName,
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
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
