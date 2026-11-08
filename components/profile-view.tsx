import { IMAGE_SIZE } from "@/lib/avatars";
import type { Block } from "@/lib/blocks";
import Image from "next/image";
import type { ReactNode } from "react";
import { BlockList } from "./blocks/registry";

export interface ProfileViewData {
  name: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  blocks: Block[];
}

/**
 * Contenu d'une page publique (bannière, photo, nom, bio, blocs). Partagé par
 * la page /<pseudo> et l'aperçu en direct du dashboard : même rendu partout.
 */
export default function ProfileView({
  profile,
  eager = false,
  blocksSlot,
}: {
  profile: ProfileViewData;
  /** Remplace la grille des blocs (ex. grille triable du mode « Réorganiser »). */
  blocksSlot?: ReactNode;
  /** Images chargées sans attendre (page publique, au-dessus de la ligne de flottaison). */
  eager?: boolean;
}) {
  const loading = eager ? "eager" : "lazy";

  return (
    <>
      <header className="mb-8">
        {profile.bannerUrl && (
          <div className="aspect-[3/1] w-full overflow-hidden rounded-2xl mb-4">
            <Image
              src={profile.bannerUrl}
              alt=""
              width={IMAGE_SIZE.banner.width}
              height={IMAGE_SIZE.banner.height}
              loading={loading}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        {profile.avatarUrl && (
          <Image
            src={profile.avatarUrl}
            alt={`Photo de profil de ${profile.name}`}
            width={IMAGE_SIZE.avatar.width}
            height={IMAGE_SIZE.avatar.height}
            loading={loading}
            className={`mx-auto mb-4 h-24 w-24 rounded-full object-cover border-4 ${
              profile.bannerUrl ? "-mt-16 relative" : ""
            }`}
            style={{ borderColor: "var(--bg-color)" }}
          />
        )}
        <h1 className="text-3xl font-semibold mb-2">{profile.name}</h1>
        <p className="profile-bio mb-8">{profile.bio}</p>
      </header>
      <nav>{blocksSlot ?? <BlockList blocks={profile.blocks} />}</nav>
    </>
  );
}
