"use client";

import PageThemeScope from "@/components/page-theme-scope";
import ProfileView from "@/components/profile-view";
import { BLOCK_COLUMNS, toBlocks, type Block } from "@/lib/blocks";
import { supabaseClient } from "@/lib/supabase-auth";
import { parseTheme, type PageTheme } from "@/lib/themes";
import type { Session, User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from "react";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio: string;
  /** URL publique dans le bucket « avatars », null sans image. */
  avatar_url: string | null;
  banner_url: string | null;
  /** Thème de la page, validé (thème par défaut si users.theme est NULL). */
  theme: PageTheme;
}

/** Modifications pas encore enregistrées, montrées dans l'aperçu en direct. */
export interface ProfileDraft {
  name: string;
  bio: string;
}

/** Champs d'un bloc « link » en cours d'édition (id null : bloc pas encore ajouté). */
export interface BlockDraft {
  id: string | null;
  title: string;
  url: string;
  icon: string;
}

interface DashboardContextValue {
  user: User;
  /** null si le trigger n'a pas encore créé la ligne public.users. */
  profile: UserProfile | null;
  /** Relit le profil (après une sauvegarde) et le renvoie. */
  reloadProfile: () => Promise<UserProfile | null>;
  /** Blocs enregistrés, dans l'ordre d'affichage. */
  blocks: Block[];
  /** true si le dernier chargement des blocs a échoué. */
  blocksError: boolean;
  reloadBlocks: () => Promise<void>;
  /** Enregistre un nouvel ordre (affiché tout de suite) ; false en cas d'échec. */
  reorderBlocks: (ordered: Block[]) => Promise<boolean>;
  /** Brouillons affichés par l'aperçu ; null quand rien n'est en cours. */
  setProfileDraft: (draft: ProfileDraft | null) => void;
  setEditDraft: (draft: BlockDraft | null) => void;
  setNewDraft: (draft: BlockDraft | null) => void;
  setThemeDraft: (draft: PageTheme | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

/** Session et profil partagés par les sous-pages du dashboard. */
export function useDashboard(): DashboardContextValue {
  const value = useContext(DashboardContext);
  if (!value) {
    throw new Error("useDashboard doit être utilisé dans DashboardShell.");
  }
  return value;
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  debug("[Dashboard] Chargement du profil.");
  const { data, error } = await supabaseClient
    .from("users")
    // Colonnes explicites : `email` n'est pas lisible via l'API (droits par colonne).
    // L'email de l'utilisateur connecté vient de la session (user.email).
    .select("id, username, name, bio, avatar_url, banner_url, theme")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Dashboard] Échec du chargement du profil.");
    return null;
  }
  if (data) {
    debug("[Dashboard] Profil chargé.");
  } else {
    console.warn("[Dashboard] Aucun profil associé à la session.");
  }
  return data ? { ...data, theme: parseTheme(data.theme) } : null;
}

async function fetchBlocks(userId: string): Promise<Block[] | null> {
  debug("[Dashboard] Chargement des blocs.");
  const { data, error } = await supabaseClient
    .from("links")
    .select(BLOCK_COLUMNS)
    .eq("user_id", userId)
    .order("order", { ascending: true });

  if (error) {
    console.error("[Dashboard] Échec du chargement des blocs.");
    return null;
  }
  debug("[Dashboard] Blocs chargés.");
  return toBlocks(data);
}

/** Applique les brouillons aux blocs enregistrés, pour l'aperçu. */
function previewBlocks(
  blocks: Block[],
  editDraft: BlockDraft | null,
  newDraft: BlockDraft | null,
): Block[] {
  const merged = blocks.map((block) =>
    editDraft && block.id === editDraft.id
      ? {
          ...block,
          title: editDraft.title,
          url: editDraft.url,
          icon: editDraft.icon,
        }
      : block,
  );
  if (newDraft && (newDraft.title.trim() || newDraft.url.trim())) {
    merged.push({
      id: "__nouveau-bloc",
      type: "link",
      title: newDraft.title.trim() || "Nouveau lien",
      url: newDraft.url,
      icon: newDraft.icon,
      data: {},
      size: "wide",
      order: Number.MAX_SAFE_INTEGER,
    });
  }
  return merged;
}

const tabs = [
  { href: "/dashboard/profil", label: "Profil" },
  { href: "/dashboard/blocs", label: "Liens" },
  { href: "/dashboard/apparence", label: "Apparence" },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blocksError, setBlocksError] = useState(false);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const [editDraft, setEditDraft] = useState<BlockDraft | null>(null);
  const [newDraft, setNewDraft] = useState<BlockDraft | null>(null);
  const [themeDraft, setThemeDraft] = useState<PageTheme | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const initSession = async (session: Session | null) => {
    if (!session) {
      debug("[Dashboard] Aucune session active.");
      router.push("/login");
      return;
    }

    debug("[Dashboard] Session active trouvée.");
    setUser(session.user);
    const [loadedProfile, loadedBlocks] = await Promise.all([
      fetchProfile(session.user.id),
      fetchBlocks(session.user.id),
    ]);
    setProfile(loadedProfile);
    setBlocks(loadedBlocks ?? []);
    setBlocksError(loadedBlocks === null);
    setLoading(false);
  };

  // Vérification de session au montage uniquement. useEffectEvent lit toujours
  // la dernière version de initSession sans en faire une dépendance de l'effet ;
  // les mises à jour d'état ont lieu dans le callback de la promesse.
  const onSession = useEffectEvent((session: Session | null) => {
    initSession(session);
  });

  useEffect(() => {
    debug("[Dashboard] Vérification de la session active.");
    supabaseClient.auth
      .getSession()
      .then(({ data: { session } }) => onSession(session));
  }, []);

  const reloadProfile = async () => {
    if (!user) return null;
    const data = await fetchProfile(user.id);
    setProfile(data);
    return data;
  };

  const reloadBlocks = async () => {
    if (!user) return;
    const data = await fetchBlocks(user.id);
    if (data) setBlocks(data);
    setBlocksError(data === null);
  };

  const reorderBlocks = async (ordered: Block[]) => {
    if (!user) return false;
    // Affichage immédiat, puis une seule requête pour tout l'ordre.
    setBlocks(ordered.map((block, index) => ({ ...block, order: index + 1 })));
    const { error } = await supabaseClient.rpc("reorder_blocks", {
      ids: ordered.map((block) => block.id),
    });
    if (error) {
      console.error(
        "[Dashboard] Échec de l'enregistrement de l'ordre des blocs.",
      );
      await reloadBlocks();
      return false;
    }
    debug("[Dashboard] Ordre des blocs enregistré.");
    return true;
  };

  const handleLogout = async () => {
    debug("[Dashboard] Déconnexion.");
    await supabaseClient.auth.signOut();
    router.push("/");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider
      value={{
        user,
        profile,
        reloadProfile,
        blocks,
        blocksError,
        reloadBlocks,
        reorderBlocks,
        setProfileDraft,
        setEditDraft,
        setNewDraft,
        setThemeDraft,
      }}
    >
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4 py-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
            <div>
              <Link
                href="/"
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-1 inline-flex items-center gap-1"
              >
                ← Retour à l’accueil
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {profile && (
                <Link
                  href={`/${profile.username}`}
                  className="justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-1.5"
                >
                  🔗 Voir ma page
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>

          {/* Navigation entre les sous-pages */}
          <nav
            aria-label="Sections du dashboard"
            className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700"
          >
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`-mb-px px-4 py-2 border-b-2 font-medium transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
            <div className="min-w-0">
              {/* Sur petit écran, l'aperçu s'ouvre au-dessus du formulaire. */}
              <button
                type="button"
                onClick={() => setShowPreview((shown) => !shown)}
                aria-expanded={showPreview}
                aria-controls="apercu-page"
                className="lg:hidden mb-4 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white"
              >
                {showPreview ? "Masquer l’aperçu" : "👁️ Voir l’aperçu"}
              </button>
              {children}
            </div>

            <aside
              id="apercu-page"
              aria-label="Aperçu de ma page"
              className={`${showPreview ? "block" : "hidden"} lg:block order-first lg:order-none lg:sticky lg:top-8`}
            >
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Aperçu en direct
              </p>
              {/* inert : l'aperçu se regarde, ses liens ne s'ouvrent pas. */}
              <PageThemeScope
                inert
                theme={themeDraft ?? profile?.theme ?? parseTheme(null)}
                className="max-h-[75vh] overflow-y-auto rounded-3xl border border-gray-300 dark:border-gray-600 p-5 text-center shadow-inner"
              >
                <ProfileView
                  profile={{
                    name: profileDraft?.name ?? profile?.name ?? "",
                    bio: profileDraft?.bio ?? profile?.bio ?? "",
                    avatarUrl: profile?.avatar_url ?? null,
                    bannerUrl: profile?.banner_url ?? null,
                    blocks: previewBlocks(blocks, editDraft, newDraft),
                  }}
                />
              </PageThemeScope>
            </aside>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
