import { supabase } from "@/lib/supabase";
import { siteName } from "@/lib/site";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
//import UserPageClient from "./user-page-client";
import UserPageClient from "@/app/[username]/user-page-client";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

// Relire le profil et ses liens depuis Supabase à chaque visite.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

// Partagé entre generateMetadata et la page : une seule requête Supabase par visite.
const getProfile = cache(async (username: string) => {
  // Colonnes explicites : `email` n'est pas lisible publiquement (droits par colonne).
  const { data, error } = await supabase
    .from("users")
    .select("id, username, name, bio, avatar_url, banner_url")
    .eq("username", username)
    .single();

  return error ? null : data;
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = username.toLowerCase();
  const profile = await getProfile(user);

  if (!profile) {
    return {
      title: `Page introuvable - ${siteName}`,
      robots: { index: false },
    };
  }

  const title = `${profile.name} - ${siteName}`;
  const description =
    profile.bio?.trim() ||
    `Retrouvez tous les liens de ${profile.name} sur ${siteName}.`;

  return {
    title,
    description,
    alternates: { canonical: `/${user}` },
    openGraph: {
      title,
      description,
      url: `/${user}`,
      type: "profile",
      siteName,
      locale: "fr_FR",
      ...(profile.avatar_url && {
        images: [{ url: profile.avatar_url, alt: profile.name }],
      }),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  const user = username.toLowerCase();

  debug("[UserPage] Requête de page publique.");

  // Rediriger si l'URL contient des majuscules
  if (username !== user) {
    debug("[UserPage] Redirection vers une URL normalisée.");
    redirect(`/${user}`);
  }

  // Récupérer l'utilisateur depuis Supabase
  debug("[UserPage] Recherche du profil public.");
  const userData = await getProfile(user);

  if (!userData) {
    debug("[UserPage] Profil public introuvable.");
    notFound();
  }

  debug("[UserPage] Profil public trouvé.");

  // Récupérer les liens de l'utilisateur
  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userData.id)
    .order("order", { ascending: true });

  if (linksError) {
    console.error("[UserPage] Échec du chargement des liens publics.");
  } else {
    debug("[UserPage] Liens publics chargés.");
  }

  const userWithLinks = {
    name: userData.name,
    bio: userData.bio || "",
    avatarUrl: userData.avatar_url,
    bannerUrl: userData.banner_url,
    links:
      links?.map((link) => ({
        title: link.title,
        url: link.url,
        icon: link.icon,
      })) || [],
  };

  return <UserPageClient userData={userWithLinks} />;
}
