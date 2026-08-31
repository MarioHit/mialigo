import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "magiclink"
    | "email"
    | "signup"
    | null;
  const next = searchParams.get("next") ?? "/dashboard";

  debug("[Auth/Callback] Requête reçue.");

  const supabase = await createSupabaseServerClient();
  let authenticatedUser = null;

  // Cas 1 : Token hash (Server-side OTP / True Magic Link) -> Fonctionne sur N'IMPORTE QUEL appareil/navigateur !
  if (token_hash && type) {
    debug("[Auth/Callback] Validation du lien magique par token hash.");
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type === "signup" ? "signup" : "magiclink",
    });

    if (!error && data.user) {
      debug("[Auth/Callback] Lien magique validé.");
      authenticatedUser = data.user;
    } else {
      console.error(
        "[Auth/Callback] Échec de la vérification du lien magique.",
        error?.message || "Utilisateur introuvable",
      );
    }
  }

  // Cas 2 : Code PKCE standard (Fallback si lien classique)
  if (!authenticatedUser && code) {
    debug("[Auth/Callback] Échange du code PKCE contre une session.");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      debug("[Auth/Callback] Session PKCE échangée.");
      authenticatedUser = data.user;
    } else {
      console.error(
        "[Auth/Callback] Échec de l'échange du code PKCE.",
        error?.message || "Utilisateur introuvable",
      );
    }
  }

  // Traitement de l'utilisateur authentifié
  if (authenticatedUser) {
    debug("[Auth/Callback] Utilisateur authentifié.");

    // Synchronisation de sécurité du profil public.users
    try {
      debug("[Auth/Callback] Vérification du profil.");
      const { data: existingUser, error: fetchErr } = await supabase
        .from("users")
        .select("id, username")
        .eq("id", authenticatedUser.id)
        .maybeSingle();

      if (fetchErr) {
        console.warn(
          "[Auth/Callback] Erreur lors de la vérification du profil.",
          fetchErr.message,
        );
      }

      if (!existingUser) {
        debug("[Auth/Callback] Création du profil absent.");
        const meta = authenticatedUser.user_metadata || {};
        const emailPrefix = authenticatedUser.email?.split("@")[0] || "user";
        const newUsername = (meta.username || emailPrefix)
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "");
        const newName = meta.name || newUsername;

        const { error: insertError } = await supabase.from("users").upsert({
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          username: newUsername,
          name: newName,
          bio: "Bienvenue sur ma page !",
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error(
            "[Auth/Callback] Erreur lors de la création du profil.",
            insertError.message,
          );
        } else {
          debug("[Auth/Callback] Profil créé.");
        }
      } else {
        debug("[Auth/Callback] Profil existant confirmé.");
      }
    } catch (profileErr) {
      console.error(
        "[Auth/Callback] Exception pendant la synchronisation du profil.",
        profileErr instanceof Error ? profileErr.message : "Erreur inconnue",
      );
    }

    debug("[Auth/Callback] Authentification réussie, redirection en cours.");
    return NextResponse.redirect(`${origin}${next}`);
  }

  // En cas d'échec
  console.warn("[Auth/Callback] Échec de validation du lien magique.");
  return NextResponse.redirect(
    `${origin}/login?error=Le lien de connexion est invalide ou a expiré`,
  );
}
