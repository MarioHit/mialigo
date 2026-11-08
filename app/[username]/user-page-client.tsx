"use client";

import ProfileView, { type ProfileViewData } from "@/components/profile-view";
import { supabaseClient } from "@/lib/supabase-auth";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserPageClientProps {
  userData: ProfileViewData;
}

export default function UserPageClient({ userData }: UserPageClientProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (mounted) setIsAuthenticated(Boolean(session));
    };

    checkSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

      <main className="w-full max-w-md text-center p-5">
        <ProfileView profile={userData} eager />

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
    </>
  );
}
