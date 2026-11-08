"use client";

import { isReservedUsername } from "@/lib/reserved-usernames";
import { supabaseClient } from "@/lib/supabase-auth";
import { useEffect, useState } from "react";
import { useDashboard } from "../dashboard-shell";
import ProfileImages from "./profile-images";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

export default function ProfilPage() {
  const { user, profile, reloadProfile, setProfileDraft } = useDashboard();
  const [saving, setSaving] = useState(false);

  // Valeurs initiales : le profil, ou à défaut (trigger pas encore passé) les
  // métadonnées saisies à l'inscription. Le shell n'affiche cette page qu'une
  // fois la session et le profil chargés.
  const fallbackUsername = (
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    ""
  ).toLowerCase();
  const [username, setUsername] = useState(
    () => profile?.username || fallbackUsername,
  );
  const [name, setName] = useState(
    () => profile?.name || user.user_metadata?.name || fallbackUsername,
  );
  const [bio, setBio] = useState(() =>
    profile ? profile.bio || "" : "Bienvenue sur ma page !",
  );

  // Le brouillon de l'aperçu disparaît quand on quitte la page sans enregistrer.
  useEffect(() => () => setProfileDraft(null), [setProfileDraft]);

  const updateName = (value: string) => {
    setName(value);
    setProfileDraft({ name: value, bio });
  };

  const updateBio = (value: string) => {
    setBio(value);
    setProfileDraft({ name, bio: value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const cleanUsername = username.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanBio = bio.trim();

    // Un profil existant peut conserver son pseudo, mais on ne peut pas en choisir un réservé.
    if (
      cleanUsername !== profile?.username &&
      isReservedUsername(cleanUsername)
    ) {
      debug("[Dashboard] Pseudo réservé refusé.");
      alert("Ce nom d'utilisateur est réservé, choisissez-en un autre.");
      setSaving(false);
      return;
    }

    debug("[Dashboard] Sauvegarde du profil.");

    const fields = {
      username: cleanUsername,
      name: cleanName,
      bio: cleanBio,
      updated_at: new Date().toISOString(),
    };

    // update si le profil existe, insert sinon (secours si le trigger n'a pas créé le profil).
    // Pas d'upsert : il exigerait le droit de LIRE email, retiré aux rôles de l'API.
    const { error } = profile
      ? await supabaseClient.from("users").update(fields).eq("id", user.id)
      : await supabaseClient
          .from("users")
          .insert({ id: user.id, email: user.email, ...fields });

    if (error) {
      console.error("[Dashboard] Échec de la sauvegarde du profil.");
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else {
      debug("[Dashboard] Profil sauvegardé.");
      alert("✅ Profil mis à jour !");
      const saved = await reloadProfile();
      setProfileDraft(null);
      if (saved) {
        setUsername(saved.username || "");
        setName(saved.name || "");
        setBio(saved.bio || "");
      }
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Mon Profil
        </h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Nom d’utilisateur (URL)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-gray-500 shrink-0">mialigo.com/</span>
              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                  )
                }
                className="w-full min-w-0 flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Nom affiché
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => updateBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "💾 Enregistrer"}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Photo et bannière
        </h2>
        <ProfileImages />
      </div>
    </div>
  );
}
