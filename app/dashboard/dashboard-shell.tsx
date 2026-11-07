"use client";

import { supabaseClient } from "@/lib/supabase-auth";
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
}

interface DashboardContextValue {
  user: User;
  /** null si le trigger n'a pas encore créé la ligne public.users. */
  profile: UserProfile | null;
  /** Relit le profil (après une sauvegarde) et le renvoie. */
  reloadProfile: () => Promise<UserProfile | null>;
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
    .select("id, username, name, bio")
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
  return data;
}

const tabs = [
  { href: "/dashboard/profil", label: "Profil" },
  { href: "/dashboard/blocs", label: "Liens" },
];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
    setProfile(await fetchProfile(session.user.id));
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
    <DashboardContext.Provider value={{ user, profile, reloadProfile }}>
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4 py-20 sm:px-6 sm:py-8 lg:px-8">
        <div className="max-w-4xl mx-auto">
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

          {children}
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
