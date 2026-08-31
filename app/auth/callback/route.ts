import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

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

  console.log(`[Auth/Callback] 📥 Requête reçue:`, {
    origin,
    hasCode: Boolean(code),
    hasTokenHash: Boolean(token_hash),
    type,
    next,
  });

  const supabase = await createSupabaseServerClient();
  let authenticatedUser = null;

  // Cas 1 : Token hash (Server-side OTP / True Magic Link) -> Fonctionne sur N'IMPORTE QUEL appareil/navigateur !
  if (token_hash && type) {
    console.log(
      `[Auth/Callback] 🔑 Validation du Magic Link par token_hash (type: ${type})...`,
    );
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type === "signup" ? "signup" : "magiclink",
    });

    if (!error && data.user) {
      console.log(
        `[Auth/Callback] ✅ Magic Link (token_hash) validé avec succès !`,
      );
      authenticatedUser = data.user;
    } else {
      console.error(
        `[Auth/Callback] ❌ Échec de la vérification token_hash:`,
        error?.message || "Utilisateur introuvable",
      );
    }
  }

  // Cas 2 : Code PKCE standard (Fallback si lien classique)
  if (!authenticatedUser && code) {
    console.log(
      `[Auth/Callback] 🔄 Échange du code PKCE contre une session...`,
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      console.log(`[Auth/Callback] ✅ Session PKCE échangée avec succès !`);
      authenticatedUser = data.user;
    } else {
      console.error(
        `[Auth/Callback] ❌ Échec de l'échange du code PKCE:`,
        error?.message || "Utilisateur introuvable",
      );
    }
  }

  // Traitement de l'utilisateur authentifié
  if (authenticatedUser) {
    console.log(`[Auth/Callback] 👤 Utilisateur identifié:`, {
      id: authenticatedUser.id,
      email: authenticatedUser.email,
      metadata: authenticatedUser.user_metadata,
    });

    // Synchronisation de sécurité du profil public.users
    try {
      console.log(`[Auth/Callback] 🔍 Vérification du profil public.users...`);
      const { data: existingUser, error: fetchErr } = await supabase
        .from("users")
        .select("id, username")
        .eq("id", authenticatedUser.id)
        .maybeSingle();

      if (fetchErr) {
        console.warn(
          `[Auth/Callback] ⚠️ Erreur lors de la vérification du profil:`,
          fetchErr.message,
        );
      }

      if (!existingUser) {
        console.log(
          `[Auth/Callback] ℹ️ Aucun profil public.users trouvé. Création automatique en cours...`,
        );
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
            `[Auth/Callback] ❌ Erreur lors de la création du profil:`,
            insertError.message,
          );
        } else {
          console.log(
            `[Auth/Callback] ✅ Profil public.users créé pour "${newUsername}" (ID: ${authenticatedUser.id})`,
          );
        }
      } else {
        console.log(
          `[Auth/Callback] ✅ Profil public.users existant confirmé pour "${existingUser.username}"`,
        );
      }
    } catch (profileErr) {
      console.error(
        `[Auth/Callback] ❌ Exception synchronisation profil:`,
        profileErr,
      );
    }

    console.log(
      `[Auth/Callback] 🚀 Authentification réussie. Redirection vers "${origin}${next}"...`,
    );
    return NextResponse.redirect(`${origin}${next}`);
  }

  // En cas d'échec
  console.warn(
    `[Auth/Callback] ⚠️ Échec de validation du lien magique, redirection vers /login avec message d'erreur.`,
  );
  return NextResponse.redirect(
    `${origin}/login?error=Le lien de connexion est invalide ou a expiré`,
  );
}
