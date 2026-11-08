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
// « Réorganiser » : les visiteurs ne téléchargent pas @dnd-kit.
const SortableBlockGrid = dynamic(
  () => import("@/components/blocks/sortable-block-grid"),
  {
    ssr: false,
    loading: () => (
      <p className="py-8 text-sm opacity-70">
        Chargement du mode réorganisation…
      </p>
    ),
  },
);

interface UserPageClientProps {
  userData: ProfileViewData;
  /** id du propriétaire de la page (public), pour afficher « Réorganiser ». */
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
  /** Ordre en cours de réorganisation ; null hors du mode. */
  const [draftOrder, setDraftOrder] = useState<Block[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const router = useRouter();

  const isAuthenticated = session !== null;
  // Affichage seulement : l'écriture est protégée par la RLS (reorder_blocks).
  const isOwner = session?.user.id === ownerId;
  const reordering = draftOrder !== null;

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

  const handleSaveOrder = async () => {
    if (!draftOrder) return;
    setSavingOrder(true);
    debug("[UserPage] Enregistrement du nouvel ordre des blocs.");
    const { error } = await supabaseClient.rpc("reorder_blocks", {
      ids: draftOrder.map((block) => block.id),
    });
    setSavingOrder(false);

    if (error) {
      console.error(
        "[UserPage] Échec de l'enregistrement de l'ordre des blocs.",
      );
      alert("Impossible d’enregistrer le nouvel ordre. Réessayez.");
      return;
    }
    debug("[UserPage] Ordre des blocs enregistré.");
    setDraftOrder(null);
    // Relit la page côté serveur avec le nouvel ordre.
    router.refresh();
  };

  // Pendant la réorganisation, la page affiche l'ordre en cours.
  const shownProfile = draftOrder
    ? { ...userData, blocks: draftOrder }
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
        className={`w-full max-w-md text-center p-5 ${reordering ? "pb-28" : ""}`}
      >
        {reordering && (
          <p
            className="mb-4 rounded-2xl px-4 py-2 text-sm"
            style={floatingButtonStyle}
          >
            Faites glisser vos blocs (appui long sur mobile), puis enregistrez.
          </p>
        )}
        <ProfileView
          profile={shownProfile}
          eager
          blocksSlot={
            draftOrder ? (
              <SortableBlockGrid blocks={draftOrder} onChange={setDraftOrder} />
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

      {/* Propriétaire : réorganiser sa page en voyant le vrai rendu. */}
      {isOwner && userData.blocks.length > 1 && (
        <div className="fixed inset-x-0 bottom-5 z-20 flex justify-center gap-3 px-4">
          {reordering ? (
            <>
              <button
                type="button"
                onClick={() => setDraftOrder(null)}
                disabled={savingOrder}
                className="px-5 py-3 rounded-full text-sm font-medium shadow-lg border disabled:opacity-50"
                style={floatingButtonStyle}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={savingOrder}
                className="px-5 py-3 rounded-full text-sm font-medium shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingOrder ? "Enregistrement…" : "Enregistrer l’ordre"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDraftOrder(userData.blocks)}
              className="px-5 py-3 rounded-full text-sm font-medium shadow-lg border transition-transform hover:scale-105"
              style={floatingButtonStyle}
            >
              <i
                className="fa-solid fa-arrows-up-down-left-right mr-2"
                aria-hidden="true"
              ></i>
              Réorganiser
            </button>
          )}
        </div>
      )}
    </>
  );
}
