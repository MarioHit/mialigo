// Photo de profil et bannière (#15) : constantes et utilitaires partagés
// entre le dashboard (client) et l'action serveur d'import.

/** Bucket Supabase Storage public ; chaque utilisateur écrit dans « <id>/… ». */
export const AVATAR_BUCKET = "avatars";

export type ProfileImageKind = "avatar" | "banner";

/** Colonne de public.users qui stocke l'URL publique de chaque image. */
export const IMAGE_COLUMN = {
  avatar: "avatar_url",
  banner: "banner_url",
} as const satisfies Record<ProfileImageKind, string>;

/** Dimensions finales après recadrage centré (avatar carré, bannière 3:1). */
export const IMAGE_SIZE = {
  avatar: { width: 400, height: 400 },
  banner: { width: 1500, height: 500 },
} as const satisfies Record<
  ProfileImageKind,
  { width: number; height: number }
>;

/** Limite du bucket (cf. supabase-avatars.sql). */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

/** Types acceptés par le bucket, avec l'extension du fichier stocké. */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
};

/**
 * Chemin d'un nouveau fichier. Un nom unique par envoi évite qu'un CDN ou un
 * navigateur serve l'ancienne image en cache ; l'ancien fichier est supprimé après.
 */
export function newImagePath(
  userId: string,
  kind: ProfileImageKind,
  contentType: string,
): string {
  const ext = IMAGE_EXTENSIONS[contentType] ?? "img";
  return `${userId}/${kind}-${Date.now()}.${ext}`;
}

/**
 * Retrouve le chemin dans le bucket à partir de l'URL publique stockée en base,
 * pour supprimer l'ancien fichier. null si l'URL ne vient pas de notre bucket.
 */
export function storagePathFromPublicUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Pseudo GitHub valide : lettres, chiffres et tirets, 39 caractères au plus. */
export const GITHUB_USERNAME_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/;
