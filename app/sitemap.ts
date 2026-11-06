import { supabase } from "@/lib/supabase";
import { siteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

// Régénéré au plus toutes les heures pour inclure les nouveaux profils.
export const revalidate = 3600;

const staticPages: MetadataRoute.Sitemap = [
  { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
  ...["cgu", "confidentialite", "mentions-legales", "contact", "suppression-compte"].map(
    (path) => ({
      url: `${siteUrl}/${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    }),
  ),
];

// Supabase limite chaque requête à 1000 lignes par défaut : lecture par pages.
const PAGE_SIZE = 1000;

async function getProfileEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("users")
      .select("username, updated_at")
      .order("username")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("[Sitemap] Échec du chargement des profils.", error.message);
      break;
    }

    for (const profile of data ?? []) {
      entries.push({
        url: `${siteUrl}/${encodeURIComponent(profile.username)}`,
        lastModified: profile.updated_at ?? undefined,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    if (!data || data.length < PAGE_SIZE) break;
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...staticPages, ...(await getProfileEntries())];
}
