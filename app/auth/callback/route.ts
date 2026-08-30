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

  // Cas 1 : Token hash (Server-side OTP / Email link) -> Fonctionne sur N'IMPORTE QUEL navigateur/appareil !
  if (token_hash && type) {
    console.log(
      `[Auth/Callback] 🔄 Validation par token_hash (type: ${type})...`,
    );
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type === "signup" ? "signup" : "magiclink",
    });

    if (!error) {
      console.log(
        `[Auth/Callback] ✅ OTP validé avec succès pour l'utilisateur:`,
        {
          id: data.user?.id,
          email: data.user?.email,
        },
      );
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error(
        `[Auth/Callback] ❌ Erreur verifyOtp token_hash:`,
        error.message,
      );
    }
  }

  // Cas 2 : Code PKCE standard
  if (code) {
    console.log(
      `[Auth/Callback] 🔄 Échange du code PKCE contre une session...`,
    );
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log(`[Auth/Callback] ✅ Session PKCE échangée avec succès:`, {
        id: data.user?.id,
        email: data.user?.email,
        metadata: data.user?.user_metadata,
      });

      // Synchronisation de sécurité du profil si nécessaire
      if (data.user) {
        try {
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("id", data.user.id)
            .maybeSingle();

          if (!existingUser) {
            console.log(
              `[Auth/Callback] ℹ️ Aucun profil public.users trouvé, création automatique...`,
            );
            const meta = data.user.user_metadata || {};
            const emailPrefix = data.user.email?.split("@")[0] || "user";
            const newUsername = (meta.username || emailPrefix)
              .toLowerCase()
              .replace(/[^a-z0-9_-]/g, "");
            const newName = meta.name || newUsername;

            const { error: insertError } = await supabase.from("users").upsert({
              id: data.user.id,
              email: data.user.email,
              username: newUsername,
              name: newName,
              bio: "Bienvenue sur ma page !",
              updated_at: new Date().toISOString(),
            });

            if (insertError) {
              console.warn(
                `[Auth/Callback] ⚠️ Avertissement lors de la création du profil:`,
                insertError.message,
              );
            } else {
              console.log(
                `[Auth/Callback] ✅ Profil public.users créé pour "${newUsername}"`,
              );
            }
          }
        } catch (profileErr) {
          console.error(
            `[Auth/Callback] Erreur synchronisation profil:`,
            profileErr,
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    } else {
      console.error(
        `[Auth/Callback] ❌ Erreur exchangeCodeForSession:`,
        error.message,
      );
    }
  }

  // En cas d'échec
  console.warn(
    `[Auth/Callback] ⚠️ Échec de validation du lien magique, redirection vers /login avec message d'erreur.`,
  );
  return NextResponse.redirect(
    `${origin}/login?error=Le lien de connexion est invalide ou a expiré`,
  );
}
