import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
//import UserPageClient from "./user-page-client";
import UserPageClient from "@/app/[username]/user-page-client";

// Générer les pages statiques pour tous les utilisateurs
export async function generateStaticParams() {
  const { data: users } = await supabase.from("users").select("username");

  if (!users) return [];

  // Générer uniquement les versions lowercase (convention)
  return users.map((user) => ({
    username: user.username.toLowerCase(),
  }));
}

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  const user = username.toLowerCase();

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
