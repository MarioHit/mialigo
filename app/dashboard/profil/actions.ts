"use server";

import {
  AVATAR_BUCKET,
  GITHUB_USERNAME_PATTERN,
  IMAGE_EXTENSIONS,
  MAX_IMAGE_BYTES,
  newImagePath,
  storagePathFromPublicUrl,
} from "@/lib/avatars";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createHash } from "node:crypto";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

export type ImportAvatarResult =
  { ok: true; avatarUrl: string } | { ok: false; error: string };

/**
 * Importe la photo de profil depuis Gravatar (adresse email du compte) ou
 * GitHub (pseudo saisi), et la copie dans le bucket « avatars ».
 *
 * Côté serveur : l'email n'est lu que dans la session, son empreinte ne quitte
 * jamais le serveur (seul Gravatar la reçoit) et n'est pas stockée ; la page
 * publique n'affiche que la copie (cf. ADR-0016). L'écriture passe par la session
 * de l'utilisateur : les policies Storage et la RLS s'appliquent comme depuis le
 * navigateur.
 */
export async function importAvatar(
  source: "gravatar" | "github",
  githubUsername?: string,
): Promise<ImportAvatarResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Session expirée, reconnectez-vous." };
  }

  let sourceUrl: string;
  let notFoundMessage: string;

  if (source === "gravatar") {
    if (!user.email) {
      return { ok: false, error: "Aucune adresse email sur ce compte." };
    }
    const hash = createHash("sha256")
      .update(user.email.trim().toLowerCase())
      .digest("hex");
    // d=404 : pas d'image générique, une réponse 404 si aucun Gravatar n'existe.
    sourceUrl = `https://gravatar.com/avatar/${hash}?s=400&d=404`;
    notFoundMessage = "Aucun Gravatar n’est associé à votre adresse email.";
  } else {
    const login = githubUsername?.trim() ?? "";
    if (!GITHUB_USERNAME_PATTERN.test(login)) {
      return { ok: false, error: "Pseudo GitHub invalide." };
    }
    sourceUrl = `https://github.com/${login}.png?size=400`;
    notFoundMessage = "Aucun compte GitHub ne porte ce pseudo.";
  }

  debug(`[Dashboard] Import de la photo de profil depuis ${source}.`);

  let response: Response;
  try {
    response = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
  } catch {
    console.error(`[Dashboard] Import ${source} : service injoignable.`);
    return {
      ok: false,
      error: "Le service ne répond pas, réessayez plus tard.",
    };
  }

  if (response.status === 404) {
    return { ok: false, error: notFoundMessage };
  }
  if (!response.ok) {
    console.error(`[Dashboard] Import ${source} : réponse ${response.status}.`);
    return { ok: false, error: "Impossible de récupérer l’image." };
  }

  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim();
  if (!(contentType in IMAGE_EXTENSIONS)) {
    return { ok: false, error: "Format d’image non pris en charge." };
  }

  const image = await response.arrayBuffer();
  if (image.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image trop lourde (2 Mo maximum)." };
  }

  const path = newImagePath(user.id, "avatar", contentType);
  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, image, { contentType, cacheControl: "31536000" });

  if (uploadError) {
    console.error(`[Dashboard] Import ${source} : échec de l'envoi.`);
    return { ok: false, error: "Échec de l’enregistrement de l’image." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  // Ancienne image, supprimée une fois la nouvelle enregistrée.
  const { data: previous } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    console.error(
      `[Dashboard] Import ${source} : échec de la mise à jour du profil.`,
    );
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    return { ok: false, error: "Échec de la mise à jour du profil." };
  }

  const oldPath = storagePathFromPublicUrl(previous?.avatar_url);
  if (oldPath && oldPath !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
  }

  debug(`[Dashboard] Photo de profil importée depuis ${source}.`);
  return { ok: true, avatarUrl: publicUrl };
}
