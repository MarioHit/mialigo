import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mario - Building in public",
  description:
    "Mario's social links - Instagram, YouTube, TikTok. Building in public 🚀",
  keywords: ["Mario", "social links", "Instagram", "YouTube", "TikTok"],
  authors: [{ name: "Mario" }],
  openGraph: {
    title: "Mario - Building in public",
    description: "Mario's social links - Follow my journey!",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
