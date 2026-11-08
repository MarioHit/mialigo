"use client";

import { BLOCK_SIZE_LABELS } from "@/components/blocks/registry";
import {
  blockAnnouncements,
  blockScreenReaderInstructions,
} from "@/lib/block-dnd";
import { BLOCK_SIZES, type Block, type BlockSize } from "@/lib/blocks";
import { defaultNetworkIcon } from "@/lib/social-networks";
import { supabaseClient } from "@/lib/supabase-auth";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { useDashboard } from "../dashboard-shell";
import SocialNetworkPicker from "../social-network-picker";

function debug(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message);
  }
}

interface LinkFields {
  title: string;
  url: string;
  icon: string;
}

/** Ligne déplaçable de la liste ; `children` reçoit la poignée à afficher. */
function SortableRow({
  id,
  label,
  disabled,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
  children: (handle: React.ReactNode) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  // Poignée : glisser à la souris ou au doigt, ou Espace puis flèches au clavier.
  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Déplacer ${label}`}
      disabled={disabled}
      className="shrink-0 self-center px-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing touch-none disabled:cursor-not-allowed disabled:opacity-40"
    >
      <i className="fa-solid fa-grip-vertical" aria-hidden="true"></i>
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 ${
        isDragging ? "relative z-10 shadow-lg" : ""
      }`}
    >
      {children(handle)}
    </div>
  );
}

const emptyNewLink: LinkFields = {
  title: "",
  url: "",
  icon: defaultNetworkIcon,
};

export default function BlocsPage() {
  const {
    user,
    blocks: links,
    blocksError,
    reloadBlocks,
    reorderBlocks,
    setEditDraft,
    setNewDraft,
  } = useDashboard();
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [savingLinkId, setSavingLinkId] = useState<string | null>(null);
  const [editedLink, setEditedLink] = useState<LinkFields>({
    title: "",
    url: "",
    icon: "",
  });
  const [newLink, setNewLink] = useState<LinkFields>(emptyNewLink);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    // 5 px avant de commencer : un simple clic sur la poignée ne déplace rien.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = links.findIndex((link) => link.id === active.id);
    const to = links.findIndex((link) => link.id === over.id);
    if (from === -1 || to === -1) return;

    debug("[Dashboard] Réorganisation des liens.");
    setSavingOrder(true);
    const ok = await reorderBlocks(arrayMove(links, from, to));
    setSavingOrder(false);
    if (!ok) alert("Impossible d’enregistrer le nouvel ordre. Réessayez.");
  };

  const handleSizeChange = async (linkId: string, size: BlockSize) => {
    debug("[Dashboard] Changement de taille d'un bloc.");
    const { error } = await supabaseClient
      .from("links")
      .update({ size })
      .eq("id", linkId);
    if (error) {
      console.error("[Dashboard] Échec du changement de taille.");
      alert("Erreur : " + error.message);
    }
    await reloadBlocks();
  };

  // Les brouillons de l'aperçu disparaissent quand on quitte la page.
  useEffect(
    () => () => {
      setEditDraft(null);
      setNewDraft(null);
    },
    [setEditDraft, setNewDraft],
  );

  /** Met à jour le formulaire d'édition et l'aperçu en direct. */
  const updateEditedLink = (fields: LinkFields) => {
    setEditedLink(fields);
    setEditDraft({ id: editingLinkId, ...fields });
  };

  /** Met à jour le formulaire d'ajout et l'aperçu en direct. */
  const updateNewLink = (fields: LinkFields) => {
    setNewLink(fields);
    setNewDraft({ id: null, ...fields });
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLink.title || !newLink.url) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const nextOrder =
      links.length > 0 ? Math.max(...links.map((l) => l.order)) + 1 : 1;

    debug("[Dashboard] Ajout d'un lien.");

    const { error } = await supabaseClient.from("links").insert({
      user_id: user.id,
      type: "link",
      size: "wide",
      title: newLink.title.trim(),
      url: newLink.url.trim(),
      icon: newLink.icon,
      order: nextOrder,
    });

    if (error) {
      console.error("[Dashboard] Échec de l'ajout du lien.");
      alert("Erreur : " + error.message);
    } else {
      debug("[Dashboard] Lien ajouté.");
      setNewLink(emptyNewLink);
      setNewDraft(null);
      await reloadBlocks();
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm("Supprimer ce lien ?")) return;

    debug("[Dashboard] Suppression d'un lien.");
    const { error } = await supabaseClient
      .from("links")
      .delete()
      .eq("id", linkId);

    if (error) {
      console.error("[Dashboard] Échec de la suppression du lien.");
      alert("Erreur : " + error.message);
    } else {
      debug("[Dashboard] Lien supprimé.");
      await reloadBlocks();
    }
  };

  const handleEditLink = (link: Block) => {
    const fields = { title: link.title, url: link.url, icon: link.icon };
    setEditingLinkId(link.id);
    setEditedLink(fields);
    setEditDraft({ id: link.id, ...fields });
  };

  const handleCancelEdit = () => {
    setEditingLinkId(null);
    setEditedLink({ title: "", url: "", icon: "" });
    setEditDraft(null);
  };

  const handleSaveLink = async (e: React.FormEvent, linkId: string) => {
    e.preventDefault();
    setSavingLinkId(linkId);

    debug("[Dashboard] Mise à jour d'un lien.");
    const { error } = await supabaseClient
      .from("links")
      .update({
        title: editedLink.title.trim(),
        url: editedLink.url.trim(),
        icon: editedLink.icon,
      })
      .eq("id", linkId);

    if (error) {
      console.error("[Dashboard] Échec de la mise à jour du lien.");
      alert("Erreur : " + error.message);
    } else {
      debug("[Dashboard] Lien mis à jour.");
      await reloadBlocks();
      handleCancelEdit();
    }

    setSavingLinkId(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Mes Liens
      </h2>

      {/* Liste des liens */}
      <div className="space-y-3 mb-6">
        {blocksError ? (
          <p className="text-red-600 text-center py-4">
            Impossible de charger vos liens. Rechargez la page.
          </p>
        ) : links.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Aucun lien pour le moment
          </p>
        ) : (
          <DndContext
            id="blocs-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            accessibility={{
              announcements: blockAnnouncements(links),
              screenReaderInstructions: blockScreenReaderInstructions,
            }}
          >
            <SortableContext
              items={links.map((link) => link.id)}
              strategy={verticalListSortingStrategy}
            >
              {links.map((link) => (
                <SortableRow
                  key={link.id}
                  id={link.id}
                  label={link.title}
                  disabled={editingLinkId !== null || savingOrder}
                >
                  {(handle) =>
                    editingLinkId === link.id ? (
                      <form
                        onSubmit={(e) => handleSaveLink(e, link.id)}
                        className="w-full space-y-3"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <input
                            type="text"
                            value={editedLink.title}
                            onChange={(e) =>
                              updateEditedLink({
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
                              updateEditedLink({
                                ...editedLink,
                                url: e.target.value,
                              })
                            }
                            aria-label="URL du lien"
                            className="min-w-0 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                          <SocialNetworkPicker
                            value={editedLink.icon}
                            onChange={(icon) =>
                              updateEditedLink({ ...editedLink, icon })
                            }
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
                        {handle}
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
                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                          <select
                            value={link.size}
                            onChange={(e) =>
                              handleSizeChange(
                                link.id,
                                e.target.value as BlockSize,
                              )
                            }
                            aria-label={`Taille de ${link.title}`}
                            className="px-2 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          >
                            {BLOCK_SIZES.map((size) => (
                              <option key={size} value={size}>
                                {BLOCK_SIZE_LABELS[size]}
                              </option>
                            ))}
                          </select>
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
                    )
                  }
                </SortableRow>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      {links.length > 1 && (
        <p className="-mt-3 mb-6 text-xs text-gray-500">
          Glissez la poignée{" "}
          <i className="fa-solid fa-grip-vertical" aria-hidden="true"></i> pour
          changer l’ordre ; la taille choisit la place du lien dans la grille de
          votre page. Astuce : sur votre page, le bouton « Modifier la
          disposition » permet de changer l’ordre et la taille en voyant le
          vrai rendu.
        </p>
      )}

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
              updateNewLink({ ...newLink, title: e.target.value })
            }
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={newLink.url}
            onChange={(e) => updateNewLink({ ...newLink, url: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <SocialNetworkPicker
            value={newLink.icon}
            onChange={(icon) => updateNewLink({ ...newLink, icon })}
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
  );
}
