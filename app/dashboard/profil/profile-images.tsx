"use client";

import {
  AVATAR_BUCKET,
  IMAGE_COLUMN,
  IMAGE_EXTENSIONS,
  IMAGE_SIZE,
  MAX_IMAGE_BYTES,
  newImagePath,
  storagePathFromPublicUrl,
  type ProfileImageKind,
} from "@/lib/avatars";
import { supabaseClient } from "@/lib/supabase-auth";
import Image from "next/image";
import { useRef, useState } from "react";
import { useDashboard } from "../dashboard-shell";
import { importAvatar } from "./actions";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

/** Taille maximale du fichier choisi, avant redimensionnement. */
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;

/**
 * Recadre l'image au centre et la redimensionne aux dimensions finales, dans le
 * navigateur : le fichier envoyé pèse quelques dizaines de Ko au lieu de
 * plusieurs Mo, et les métadonnées (EXIF, position GPS) ne sont pas conservées.
 */
async function resizeImage(file: File, kind: ProfileImageKind): Promise<Blob> {
  const { width, height } = IMAGE_SIZE[kind];
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const cropWidth = width / scale;
  const cropHeight = height / scale;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponible.");
  context.drawImage(
    bitmap,
    (bitmap.width - cropWidth) / 2,
    (bitmap.height - cropHeight) / 2,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );
  bitmap.close();

  return new Promise((resolve, reject) => {
    // WebP si le navigateur sait l'encoder ; sinon toBlob renvoie du PNG.
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Conversion impossible.")),
      "image/webp",
      0.85,
    );
  });
}

export default function ProfileImages() {
  const { user, profile, reloadProfile } = useDashboard();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [githubUsername, setGithubUsername] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  // Les images s'enregistrent sur un profil existant (créé par le trigger ou par
  // le premier enregistrement du formulaire).
  if (!profile) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Enregistrez d’abord votre profil pour ajouter une photo et une bannière.
      </p>
    );
  }

  const avatarUrl = profile.avatar_url;
  const bannerUrl = profile.banner_url;

  const run = async (label: string, task: () => Promise<string>) => {
    setBusy(label);
    setMessage(null);
    try {
      const text = await task();
      await reloadProfile();
      setMessage({ type: "ok", text });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Une erreur est survenue.",
      });
    } finally {
      setBusy(null);
    }
  };

  /** Enregistre l'URL dans le profil, puis supprime l'ancien fichier. */
  const saveImageUrl = async (kind: ProfileImageKind, url: string | null) => {
    const column = IMAGE_COLUMN[kind];
    const previous = kind === "avatar" ? avatarUrl : bannerUrl;
    const { error } = await supabaseClient
      .from("users")
      .update({ [column]: url, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) {
      console.error(
        "[Dashboard] Échec de la mise à jour de l'image du profil.",
      );
      throw new Error("Échec de la mise à jour du profil.");
    }
    const oldPath = storagePathFromPublicUrl(previous);
    if (oldPath) {
      await supabaseClient.storage.from(AVATAR_BUCKET).remove([oldPath]);
    }
  };

  const handleFile =
    (kind: ProfileImageKind) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // permet de rechoisir le même fichier
      if (!file) return;

      await run(kind, async () => {
        if (!file.type.startsWith("image/")) {
          throw new Error("Choisissez un fichier image.");
        }
        if (file.size > MAX_SOURCE_BYTES) {
          throw new Error("Image trop lourde (15 Mo maximum).");
        }

        debug("[Dashboard] Redimensionnement de l'image.");
        let blob: Blob;
        try {
          blob = await resizeImage(file, kind);
        } catch {
          throw new Error("Impossible de lire cette image.");
        }
        if (!(blob.type in IMAGE_EXTENSIONS) || blob.size > MAX_IMAGE_BYTES) {
          throw new Error("Impossible de préparer cette image.");
        }

        const path = newImagePath(user.id, kind, blob.type);
        debug("[Dashboard] Envoi de l'image.");
        const { error } = await supabaseClient.storage
          .from(AVATAR_BUCKET)
          .upload(path, blob, {
            contentType: blob.type,
            cacheControl: "31536000",
          });
        if (error) {
          console.error("[Dashboard] Échec de l'envoi de l'image.");
          throw new Error("Échec de l’envoi de l’image.");
        }

        const {
          data: { publicUrl },
        } = supabaseClient.storage.from(AVATAR_BUCKET).getPublicUrl(path);
        try {
          await saveImageUrl(kind, publicUrl);
        } catch (err) {
          await supabaseClient.storage.from(AVATAR_BUCKET).remove([path]);
          throw err;
        }
        return kind === "avatar"
          ? "Photo de profil mise à jour."
          : "Bannière mise à jour.";
      });
    };

  const handleRemove = (kind: ProfileImageKind) =>
    run(`remove-${kind}`, async () => {
      await saveImageUrl(kind, null);
      return kind === "avatar"
        ? "Photo de profil supprimée."
        : "Bannière supprimée.";
    });

  const handleImport = (source: "gravatar" | "github") =>
    run(source, async () => {
      const result = await importAvatar(source, githubUsername);
      if (!result.ok) throw new Error(result.error);
      return source === "gravatar"
        ? "Photo importée depuis Gravatar."
        : "Photo importée depuis GitHub.";
    });

  const disabled = busy !== null;
  const buttonClass =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";
  const primaryButton = `${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`;
  const secondaryButton = `${buttonClass} bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600`;

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Bannière
        </h3>
        <div className="aspect-[3/1] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          {bannerUrl ? (
            <Image
              src={bannerUrl}
              alt="Bannière actuelle"
              width={IMAGE_SIZE.banner.width}
              height={IMAGE_SIZE.banner.height}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-500">Aucune bannière</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={bannerInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile("banner")}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => bannerInput.current?.click()}
            className={primaryButton}
          >
            {busy === "banner" ? "Envoi..." : "Choisir une image"}
          </button>
          {bannerUrl && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleRemove("banner")}
              className={secondaryButton}
            >
              Supprimer
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Format large (3:1), recadrée au centre.
        </p>
      </div>

      {/* Photo de profil */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Photo de profil
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Photo de profil actuelle"
                width={IMAGE_SIZE.avatar.width}
                height={IMAGE_SIZE.avatar.height}
                className="h-full w-full object-cover"
              />
            ) : (
              <i
                className="fa-solid fa-user text-3xl text-gray-400"
                aria-hidden="true"
              ></i>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile("avatar")}
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => avatarInput.current?.click()}
                className={primaryButton}
              >
                {busy === "avatar" ? "Envoi..." : "Choisir une image"}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => handleImport("gravatar")}
                className={secondaryButton}
              >
                {busy === "gravatar" ? "Import..." : "Utiliser mon Gravatar"}
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemove("avatar")}
                  className={secondaryButton}
                >
                  Supprimer
                </button>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleImport("github");
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <label className="sr-only" htmlFor="github-username">
                Pseudo GitHub
              </label>
              <input
                id="github-username"
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value.trim())}
                placeholder="Pseudo GitHub"
                maxLength={39}
                className="w-full min-w-0 flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                type="submit"
                disabled={disabled || !githubUsername}
                className={secondaryButton}
              >
                {busy === "github" ? "Import..." : "Importer depuis GitHub"}
              </button>
            </form>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Image carrée, recadrée au centre. N’utilisez que des images dont vous
          avez les droits.
        </p>
      </div>

      {message && (
        <p
          role="status"
          className={`text-sm ${
            message.type === "ok"
              ? "text-green-700 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
