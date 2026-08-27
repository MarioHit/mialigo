"use client";

import { supabaseClient } from "@/lib/supabase-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  bio: string;
}

interface UserLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  order: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<UserLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [savingLinkId, setSavingLinkId] = useState<string | null>(null);
  const [editedLink, setEditedLink] = useState({
    title: "",
    url: "",
    icon: "",
  });
  const router = useRouter();

  // Form states
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Nouveau lien
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    icon: "fa-solid fa-link",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    setUser(session.user);
    await loadProfile(session.user.id);
    await loadLinks(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username);
      setName(data.name);
      setBio(data.bio || "");
    }
  };

  const loadLinks = async (userId: string) => {
    const { data } = await supabaseClient
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("order", { ascending: true });

    if (data) setLinks(data);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabaseClient
      .from("users")
      .update({
        username: username.toLowerCase(),
        name,
        bio,
      })
      .eq("id", user.id);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      alert("✅ Profil mis à jour !");
      await loadProfile(user.id);
    }

    setSaving(false);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLink.title || !newLink.url) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const nextOrder =
      links.length > 0 ? Math.max(...links.map((l) => l.order)) + 1 : 1;

    const { error } = await supabaseClient.from("links").insert({
      user_id: user.id,
      title: newLink.title,
      url: newLink.url,
      icon: newLink.icon,
      order: nextOrder,
    });

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      setNewLink({ title: "", url: "", icon: "fa-solid fa-link" });
      await loadLinks(user.id);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Supprimer ce lien ?")) return;

    const { error } = await supabaseClient
      .from("links")
      .delete()
      .eq("id", linkId);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await loadLinks(user.id);
    }
  };

  const handleEditLink = (link: UserLink) => {
    setEditingLinkId(link.id);
    setEditedLink({
      title: link.title,
      url: link.url,
      icon: link.icon,
    });
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditedLink({ title: "", url: "", icon: "" });
  };

  const handleSaveLink = async (e: React.FormEvent, linkId: string) => {
    e.preventDefault();
    setSavingLinkId(linkId);

    const { error } = await supabaseClient
      .from("links")
      .update({
        title: editedLink.title,
        url: editedLink.url,
        icon: editedLink.icon,
      })
      .eq("id", linkId);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      await loadLinks(user.id);
      handleCancelEdit();
    }

    setSavingLinkId(null);
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/");
  };

  if (loading) {
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
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 px-4 py-20 sm:px-6 sm:py-8 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mb-1 inline-flex items-center gap-1"
            >
              ← Retour à l'accueil
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

        {/* Profil */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Mon Profil
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nom d'utilisateur (URL)
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
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setBio(e.target.value)}
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

        {/* Liens */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Mes Liens
          </h2>

          {/* Liste des liens */}
          <div className="space-y-3 mb-6">
            {links.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucun lien pour le moment
              </p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg dark:border-gray-600"
                >
                  {editingLinkId === link.id ? (
                    <form
                      onSubmit={(e) => handleSaveLink(e, link.id)}
                      className="w-full space-y-3"
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          value={editedLink.title}
                          onChange={(e) =>
                            setEditedLink({
                              ...editedLink,
                              title: e.target.value,
                            })
                          }
                          aria-label="Nom du lien"
                          className="min-w-0 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <input
                          type="url"
                          value={editedLink.url}
                          onChange={(e) =>
                            setEditedLink({
                              ...editedLink,
                              url: e.target.value,
                            })
                          }
                          aria-label="URL du lien"
                          className="min-w-0 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <input
                          type="text"
                          value={editedLink.icon}
                          onChange={(e) =>
                            setEditedLink({
                              ...editedLink,
                              icon: e.target.value,
                            })
                          }
                          aria-label="Icône du lien"
                          className="min-w-0 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={savingLinkId === link.id}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {savingLinkId === link.id
                            ? "Enregistrement..."
                            : "Enregistrer"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <i
                        className={`${link.icon} shrink-0 text-xl w-6 text-center mt-0.5`}
                      ></i>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {link.title}
                        </p>
                        <p className="text-sm text-gray-500 break-all">
                          {link.url}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditLink(link)}
                          aria-label={`Modifier ${link.title}`}
                          className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          aria-label={`Supprimer ${link.title}`}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Ajouter un lien */}
          <form
            onSubmit={handleAddLink}
            className="border-t pt-6 dark:border-gray-600"
          >
            <h3 className="font-medium mb-4 text-gray-900 dark:text-white">
              Ajouter un lien
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Titre (ex: Instagram)"
                value={newLink.title}
                onChange={(e) =>
                  setNewLink({ ...newLink, title: e.target.value })
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="url"
                placeholder="URL (https://...)"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="text"
                placeholder="Icône (fa-brands fa-instagram)"
                value={newLink.icon}
                onChange={(e) =>
                  setNewLink({ ...newLink, icon: e.target.value })
                }
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Ajouter
            </button>
          </form>

          {/* Aide icônes */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
            <p className="text-blue-800 dark:text-blue-200">
              💡 <strong>Icônes :</strong> Utilisez Font Awesome (
              <a
                href="https://fontawesome.com/icons"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                recherche
              </a>
              ) - Ex: <code>fa-brands fa-instagram</code>,{" "}
              <code>fa-brands fa-tiktok</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
