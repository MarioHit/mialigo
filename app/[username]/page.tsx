import { supabase } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
//import UserPageClient from "./user-page-client";
import UserPageClient from "@/app/[username]/user-page-client";

// Relire le profil et ses liens depuis Supabase à chaque visite.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  const user = username.toLowerCase();

  console.log(`[UserPage] 🌐 Requête page publique pour: "${username}"`);

  // Rediriger si l'URL contient des majuscules
  if (username !== user) {
    console.log(
      `[UserPage] 🔀 Redirection majuscule -> minuscule: "${username}" -> "/${user}"`,
    );
    redirect(`/${user}`);
  }

  // Récupérer l'utilisateur depuis Supabase
  console.log(
    `[UserPage] 🔍 Recherche de l'utilisateur "${user}" dans public.users...`,
  );
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("username", user)
    .single();

  if (userError || !userData) {
    console.warn(
      `[UserPage] ⚠️ Utilisateur "${user}" non trouvé en base -> affichage 404.`,
      userError?.message,
    );
    notFound();
  }

  console.log(
    `[UserPage] ✅ Utilisateur trouvé (id: "${userData.id}", nom: "${userData.name}"). Chargement des liens...`,
  );

  // Récupérer les liens de l'utilisateur
  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userData.id)
    .order("order", { ascending: true });

  if (linksError) {
    console.error(
      `[UserPage] ❌ Erreur chargement liens pour "${user}":`,
      linksError.message,
    );
  } else {
    console.log(
      `[UserPage] ✅ ${links?.length || 0} lien(s) chargé(s) pour "${user}".`,
    );
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
