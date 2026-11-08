"use client";

import ProfileView, { type ProfileViewData } from "@/components/profile-view";
import type { Block } from "@/lib/blocks";
import { supabaseClient } from "@/lib/supabase-auth";
import type { Session } from "@supabase/supabase-js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

// Grille triable chargée seulement quand le propriétaire passe en mode
// « Modifier la disposition » : les visiteurs ne téléchargent pas @dnd-kit.
const SortableBlockGrid = dynamic(
  () => import("@/components/blocks/sortable-block-grid"),
  {
    ssr: false,
    loading: () => (
      <p className="py-8 text-sm opacity-70">Chargement du mode disposition…</p>
    ),
  },
);

interface UserPageClientProps {
  userData: ProfileViewData;
  /** id du propriétaire de la page (public), pour afficher « Modifier la disposition ». */
  ownerId: string;
}

const floatingButtonStyle = {
  backgroundColor: "var(--btn-bg)",
  color: "var(--btn-text)",
  borderColor: "var(--link-border)",
};

export default function UserPageClient({
  userData,
  ownerId,
}: UserPageClientProps) {
  const [session, setSession] = useState<Session | null>(null);
  /** Disposition (ordre et tailles) en cours de modification ; null hors du mode. */
  const [draftLayout, setDraftLayout] = useState<Block[] | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);
  const router = useRouter();

  const isAuthenticated = session !== null;
  // Affichage seulement : l'écriture est protégée par la RLS (reorder_blocks).
  const isOwner = session?.user.id === ownerId;
  const editingLayout = draftLayout !== null;

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (mounted) setSession(session);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /** Enregistre la disposition : tailles modifiées, puis ordre s'il a changé. */
  const handleSaveLayout = async () => {
    if (!draftLayout) return;
    setSavingLayout(true);
    debug("[UserPage] Enregistrement de la disposition des blocs.");

    // Taille ou position (data.align) modifiée : un seul update par bloc.
    const saved = new Map(userData.blocks.map((block) => [block.id, block]));
    const changed = draftLayout.filter((block) => {
      const before = saved.get(block.id);
      return (
        !before ||
        before.size !== block.size ||
        before.data.align !== block.data.align
      );
    });
    const orderChanged = draftLayout.some(
      (block, index) => userData.blocks[index]?.id !== block.id,
    );

    // Écritures limitées aux blocs du propriétaire par la RLS.
    const results = await Promise.all([
      ...changed.map((block) =>
        supabaseClient
          .from("links")
          .update({ size: block.size, data: block.data })
          .eq("id", block.id),
      ),
      ...(orderChanged
        ? [
            supabaseClient.rpc("reorder_blocks", {
              ids: draftLayout.map((block) => block.id),
            }),
          ]
        : []),
    ]);
    setSavingLayout(false);

    if (results.some(({ error }) => error)) {
      console.error("[UserPage] Échec de l'enregistrement de la disposition.");
      alert("Impossible d’enregistrer la disposition. Réessayez.");
      return;
    }
    debug("[UserPage] Disposition des blocs enregistrée.");
    setDraftLayout(null);
    // Relit la page côté serveur avec la nouvelle disposition.
    router.refresh();
  };

  // Pendant la modification, la page affiche la disposition en cours.
  const shownProfile = draftLayout
    ? { ...userData, blocks: draftLayout }
    : userData;

  return (
    <>
      {/* Bouton retour accueil */}
      <Link
        href="/"
        className="fixed top-5 left-5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-sm border"
        style={{
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-text)",
          borderColor: "var(--link-border)",
        }}
        aria-label="Retour à l'accueil"
      >
        <span>← Accueil</span>
      </Link>

      {isAuthenticated && (
        <Link
          href="/dashboard"
          className="fixed top-5 right-20 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-sm border"
          style={{
            backgroundColor: "var(--btn-bg)",
            color: "var(--btn-text)",
            borderColor: "var(--link-border)",
          }}
          aria-label="Modifier ma page"
        >
          <span>✎ Modifier</span>
        </Link>
      )}

      <main
        className={`w-full max-w-md text-center p-5 ${editingLayout ? "pb-28" : ""}`}
      >
        {editingLayout && (
          <p
            className="mb-4 rounded-2xl px-4 py-2 text-sm"
            style={floatingButtonStyle}
          >
            Faites glisser vos blocs (appui long sur mobile) et choisissez leur
            taille, puis enregistrez.
          </p>
        )}
        <ProfileView
          profile={shownProfile}
          eager
          blocksSlot={
            draftLayout ? (
              <SortableBlockGrid
                blocks={draftLayout}
                onChange={setDraftLayout}
              />
            ) : undefined
          }
        />

        <footer className="mt-8 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-color)" }}
          >
            <span>
              Créé avec <strong className="font-semibold">Mialigo</strong>
            </span>
          </Link>
        </footer>
      </main>

      {/* Propriétaire : ordre et taille des blocs, en voyant le vrai rendu. */}
      {isOwner && userData.blocks.length > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-20 flex justify-center gap-3 px-4">
          {editingLayout ? (
            <>
              <button
                type="button"
                onClick={() => setDraftLayout(null)}
                disabled={savingLayout}
                className="px-5 py-3 rounded-full text-sm font-medium shadow-lg border disabled:opacity-50"
                style={floatingButtonStyle}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveLayout}
                disabled={savingLayout}
                className="px-5 py-3 rounded-full text-sm font-medium shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingLayout ? "Enregistrement…" : "Enregistrer"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDraftLayout(userData.blocks)}
              className="px-5 py-3 rounded-full text-sm font-medium shadow-lg border transition-transform hover:scale-105"
              style={floatingButtonStyle}
            >
              <i
                className="fa-solid fa-arrows-up-down-left-right mr-2"
                aria-hidden="true"
              ></i>
              Modifier la disposition
            </button>
          )}
        </div>
      )}
    </>
  );
}
