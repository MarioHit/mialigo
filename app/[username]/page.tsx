import { notFound } from "next/navigation";
import UserPageClient from "./user-page-client";

// Données temporaires - sera remplacé par Supabase
export const USERS_DATA: Record<
  string,
  {
    name: string;
    bio: string;
    links: Array<{ title: string; url: string; icon: string }>;
  }
> = {
  mario: {
    name: "Mario",
    bio: "Building in public 🚀",
    links: [
      {
        title: "Instagram",
        url: "https://www.instagram.com/muvunyi_1?igsh=MWZ6OXNtNHpoZ3RuZA==",
        icon: "fa-brands fa-instagram",
      },
      {
        title: "Youtube",
        url: "https://youtube.com/@mario-try-again?si=v7Nm_L8VYk1KXwdg",
        icon: "fa-brands fa-youtube",
      },
      {
        title: "Tiktok",
        url: "https://www.tiktok.com/@justdidit64?_r=1&_t=ZN-97vIqHhqkEA",
        icon: "fa-brands fa-tiktok",
      },
    ],
  },
};

// Générer les pages statiques pour GitHub Pages
export async function generateStaticParams() {
  return Object.keys(USERS_DATA).map((username) => ({
    username,
  }));
}

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  const user = username.toLowerCase();

  // Vérifier si l'utilisateur existe
  const userData = USERS_DATA[user];
  if (!userData) {
    notFound();
  }

  return <UserPageClient userData={userData} />;
}
