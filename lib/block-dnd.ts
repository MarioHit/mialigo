// Drag & drop des blocs (#18, #90) : textes pour lecteurs d'écran, partagés par
// la liste du dashboard et la réorganisation sur la page publique.

import type { Announcements, ScreenReaderInstructions } from "@dnd-kit/core";

/** Annonces en français, calculées à partir de l'ordre affiché. */
export function blockAnnouncements(
  blocks: { id: string; title: string }[],
): Announcements {
  const titleOf = (id: string | number) =>
    blocks.find((block) => block.id === id)?.title || "le bloc";
  const positionOf = (id: string | number) =>
    blocks.findIndex((block) => block.id === id) + 1;

  return {
    onDragStart: ({ active }) =>
      `${titleOf(active.id)} saisi, position ${positionOf(active.id)} sur ${blocks.length}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} au-dessus de la position ${positionOf(over.id)}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${titleOf(active.id)} déposé en position ${positionOf(over.id)}.`
        : `${titleOf(active.id)} déposé.`,
    onDragCancel: ({ active }) =>
      `Déplacement annulé, ${titleOf(active.id)} reste à sa place.`,
  };
}

export const blockScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "Pour déplacer un bloc, appuyez sur Espace, utilisez les flèches, puis Espace pour le déposer ou Échap pour annuler.",
};
