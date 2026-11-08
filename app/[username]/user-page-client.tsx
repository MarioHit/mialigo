"use client";

import PageThemeScope from "@/components/page-theme-scope";
import ProfileView, { type ProfileViewData } from "@/components/profile-view";
import type { Block } from "@/lib/blocks";
import { DEFAULT_THEME, sameTheme, type PageTheme } from "@/lib/themes";
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

// Grille triable et sélecteur de thème chargés seulement quand le propriétaire
// passe en mode « Personnaliser » : les visiteurs ne téléchargent pas @dnd-kit.
const SortableBlockGrid = dynamic(
  () => import("@/components/blocks/sortable-block-grid"),
  {
    ssr: false,
    loading: () => (
      <p className="py-8 text-sm opacity-70">Chargement du mode édition…</p>
    ),
  },
);

const ThemePicker = dynamic(() => import("@/components/theme-picker"), {
  ssr: false,
  loading: () => <p className="py-4 text-sm text-gray-500">Chargement…</p>,
});

interface UserPageClientProps {
  userData: ProfileViewData;
  /** id du propriétaire de la page (public), pour afficher « Personnaliser ». */
  ownerId: string;
  /** Thème de la page (#19), déjà validé côté serveur. */
  theme: PageTheme;
}

const floatingButtonStyle = {
  backgroundColor: "var(--btn-bg)",
  color: "var(--btn-text)",
  borderColor: "var(--link-border)",
};

export default function UserPageClient({
  userData,
  ownerId,
  theme,
}: UserPageClientProps) {
  const [session, setSession] = useState<Session | null>(null);
  /** Disposition (ordre, tailles, positions) en cours ; null hors du mode « Personnaliser ». */
  const [draftLayout, setDraftLayout] = useState<Block[] | null>(null);
  /** Thème en cours de modification (même cycle de vie que draftLayout). */
  const [draftTheme, setDraftTheme] = useState<PageTheme | null>(null);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [savingLayout, setSavingLayout] = useState(false);
  const router = useRouter();

  const isAuthenticated = session !== null;
  // Affichage seulement : l'écriture est protégée par la RLS (links, users, reorder_blocks).
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

  const startEditing = () => {
    setDraftLayout(userData.blocks);
    setDraftTheme(theme);
  };

  const stopEditing = () => {
    setDraftLayout(null);
    setDraftTheme(null);
    setShowThemePanel(false);
  };

  /** Enregistre la personnalisation : tailles et positions, ordre et thème modifiés. */
  const handleSave = async () => {
    if (!draftLayout) return;
    setSavingLayout(true);
    debug("[UserPage] Enregistrement de la personnalisation de la page.");

    // Taille ou data (position, forme…) modifiée : un seul update par bloc.
    const saved = new Map(userData.blocks.map((block) => [block.id, block]));
    const changed = draftLayout.filter((block) => {
      const before = saved.get(block.id);
      return (
        !before ||
        before.size !== block.size ||
        JSON.stringify(before.data) !== JSON.stringify(block.data)
      );
    });
    const orderChanged = draftLayout.some(
      (block, index) => userData.blocks[index]?.id !== block.id,
    );
    const themeChanged = draftTheme !== null && !sameTheme(draftTheme, theme);

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
      // Thème par défaut : NULL (contrainte users_theme_check pour le reste).
      ...(themeChanged && draftTheme
        ? [
            supabaseClient
              .from("users")
              .update({
                theme: sameTheme(draftTheme, DEFAULT_THEME) ? null : draftTheme,
                updated_at: new Date().toISOString(),
              })
              .eq("id", ownerId),
          ]
        : []),
    ]);
    setSavingLayout(false);

    if (results.some(({ error }) => error)) {
      console.error(
        "[UserPage] Échec de l'enregistrement de la personnalisation.",
      );
      alert("Impossible d’enregistrer les modifications. Réessayez.");
      return;
    }
    debug("[UserPage] Personnalisation de la page enregistrée.");
    stopEditing();
    // Relit la page côté serveur (disposition et thème enregistrés).
    router.refresh();
  };

  // Pendant la modification, la page affiche la disposition en cours.
  const shownProfile = draftLayout
    ? { ...userData, blocks: draftLayout }
    : userData;

  return (
    <>
      <PageThemeScope
        theme={draftTheme ?? theme}
        className="flex min-h-screen w-full flex-col items-center justify-center"
      >
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
          className={`w-full max-w-md text-center p-5 ${
            showThemePanel ? "pb-[60vh]" : editingLayout ? "pb-28" : ""
          }`}
        >
          {editingLayout && (
            <p
              className="mb-4 rounded-2xl px-4 py-2 text-sm"
              style={floatingButtonStyle}
            >
              Faites glisser vos blocs (appui long sur mobile), choisissez leur
              taille et l’apparence de la page, puis enregistrez.
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
      </PageThemeScope>

      {/* Hors du thème : panneau et barre restent lisibles quel que soit le style. */}
      {showThemePanel && draftTheme && (
        <section
          aria-label="Apparence de la page"
          className="fixed inset-x-0 bottom-0 z-30 max-h-[55vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-gray-800 px-4 pt-4 pb-24 text-left shadow-2xl"
        >
          <div className="mx-auto max-w-md">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Apparence
              </h2>
              <button
                type="button"
                onClick={() => setShowThemePanel(false)}
                aria-label="Fermer le panneau Apparence"
                className="rounded-full px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>
            <ThemePicker theme={draftTheme} onChange={setDraftTheme} compact />
          </div>
        </section>
      )}

      {/* Propriétaire : disposition et apparence, en voyant le vrai rendu. */}
      {isOwner && (
        <div className="fixed inset-x-0 bottom-5 z-40 flex justify-center gap-2 px-4">
          {editingLayout ? (
            <>
              <button
                type="button"
                onClick={stopEditing}
                disabled={savingLayout}
                className="px-4 py-3 rounded-full text-sm font-medium shadow-lg border disabled:opacity-50"
                style={floatingButtonStyle}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => setShowThemePanel((shown) => !shown)}
                aria-expanded={showThemePanel}
                disabled={savingLayout}
                className="px-4 py-3 rounded-full text-sm font-medium shadow-lg border disabled:opacity-50"
                style={floatingButtonStyle}
              >
                🎨 Apparence
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={savingLayout}
                className="px-4 py-3 rounded-full text-sm font-medium shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingLayout ? "Enregistrement…" : "Enregistrer"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="px-5 py-3 rounded-full text-sm font-medium shadow-lg border transition-transform hover:scale-105"
              style={floatingButtonStyle}
            >
              <i
                className="fa-solid fa-wand-magic-sparkles mr-2"
                aria-hidden="true"
              ></i>
              Personnaliser
            </button>
          )}
        </div>
      )}
    </>
  );
}
