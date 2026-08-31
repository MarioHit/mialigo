import { supabase } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
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
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("username", user)
    .single();

  if (userError || !userData) {
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
    links:
      links?.map((link) => ({
        title: link.title,
        url: link.url,
        icon: link.icon,
      })) || [],
  };

  return <UserPageClient userData={userWithLinks} />;
}
