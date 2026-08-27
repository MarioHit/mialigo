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

  // Rediriger si l'URL contient des majuscules
  if (username !== user) {
    redirect(`/${user}`);
  }

  // Récupérer l'utilisateur depuis Supabase
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("username", user)
    .single();

  if (userError || !userData) {
    notFound();
  }

  // Récupérer les liens de l'utilisateur
  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", userData.id)
    .order("order", { ascending: true });

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
