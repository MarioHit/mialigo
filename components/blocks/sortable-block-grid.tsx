"use client";

// Grille des blocs en mode « Modifier la disposition » sur la page publique (#90) :
// ordre par glisser-déposer et taille de chaque bloc.
// Chargée à la demande (next/dynamic) : les visiteurs ne téléchargent pas @dnd-kit.

import {
  blockAnnouncements,
  blockScreenReaderInstructions,
} from "@/lib/block-dnd";
import { BLOCK_SIZES, type Block, type BlockSize } from "@/lib/blocks";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { BLOCK_SIZE_CLASSES, BLOCK_SIZE_LABELS, BlockView } from "./registry";

/**
 * Aucun décalage calculé pendant le glisser, et l'ordre ne change qu'au dépôt
 * (onDragEnd). Réordonner au survol faisait bouger la grille sous le pointeur
 * (blocs de tailles différentes), ce qui relançait un survol : boucle infinie
 * (« Maximum update depth exceeded »).
 */
const noTransform: SortingStrategy = () => null;

/** Empêche un appui sur la barre de tailles de démarrer un glisser. */
const stopDrag = {
  onMouseDown: (e: React.SyntheticEvent) => e.stopPropagation(),
  onTouchStart: (e: React.SyntheticEvent) => e.stopPropagation(),
  onPointerDown: (e: React.SyntheticEvent) => e.stopPropagation(),
  onKeyDown: (e: React.SyntheticEvent) => e.stopPropagation(),
};

function SortableTile({
  block,
  isTarget,
  onResize,
}: {
  block: Block;
  /** Bloc survolé : le bloc déplacé sera déposé à sa place. */
  isTarget: boolean;
  onResize: (size: BlockSize) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: block.id,
  });
  const title = block.title || "le bloc";

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Déplacer ${title}`}
      className={`${BLOCK_SIZE_CLASSES[block.size]} relative cursor-grab touch-manipulation select-none rounded-[2rem] outline-2 outline-dashed outline-offset-4 focus-visible:outline-indigo-600 active:cursor-grabbing ${
        isTarget
          ? "outline-indigo-600 ring-4 ring-indigo-500/40"
          : "outline-indigo-400/70"
      } ${isDragging ? "opacity-30" : ""}`}
    >
      {/* La carte ne réagit pas : un appui déplace le bloc, n'ouvre pas le lien. */}
      <div className="pointer-events-none h-full" aria-hidden="true">
        <BlockView block={block} />
      </div>

      {/* Taille du bloc : posée sur le bord bas, dans l'espace entre les lignes. */}
      <div
        role="group"
        aria-label={`Taille de ${title}`}
        {...stopDrag}
        className="absolute -bottom-4 left-1/2 z-10 flex -translate-x-1/2 overflow-hidden rounded-full border text-[11px] font-medium shadow-sm"
        style={{
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-text)",
          borderColor: "var(--link-border)",
        }}
      >
        {BLOCK_SIZES.map((size) => {
          const selected = block.size === size;
          return (
            <button
              key={size}
              type="button"
              aria-pressed={selected}
              aria-label={`Taille de ${title} : ${BLOCK_SIZE_LABELS[size]}`}
              onClick={() => onResize(size)}
              className={`cursor-pointer px-2 py-0.5 ${
                selected ? "bg-indigo-600 text-white" : "hover:opacity-80"
              }`}
            >
              {BLOCK_SIZE_LABELS[size]}
            </button>
          );
        })}
      </div>
    </li>
  );
}

export default function SortableBlockGrid({
  blocks,
  onChange,
}: {
  blocks: Block[];
  /** Nouvelle disposition (ordre ou taille), non enregistrée. */
  onChange: (blocks: Block[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    // Souris : 5 px avant de commencer, un clic simple ne déplace rien.
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Mobile : appui long, pour que la page continue de défiler au doigt.
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const items = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const accessibility = useMemo(
    () => ({
      announcements: blockAnnouncements(blocks),
      screenReaderInstructions: blockScreenReaderInstructions,
    }),
    [blocks],
  );

  const resetDrag = () => {
    setActiveId(null);
    setOverId(null);
  };

  const handleDragStart = ({ active }: DragStartEvent) =>
    setActiveId(String(active.id));

  // Survol : seulement la mise en évidence de la cible, sans toucher à l'ordre.
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    const next = over && over.id !== active.id ? String(over.id) : null;
    setOverId((current) => (current === next ? current : next));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    resetDrag();
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((block) => block.id === active.id);
    const to = blocks.findIndex((block) => block.id === over.id);
    if (from !== -1 && to !== -1) onChange(arrayMove(blocks, from, to));
  };

  const handleResize = (id: string, size: BlockSize) =>
    onChange(
      blocks.map((block) => (block.id === id ? { ...block, size } : block)),
    );

  const activeBlock = blocks.find((block) => block.id === activeId);

  return (
    <DndContext
      id="page-disposition"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDrag}
      accessibility={accessibility}
    >
      <SortableContext items={items} strategy={noTransform}>
        {/* Même grille que BlockList, avec plus d'espace entre les lignes pour la barre de tailles. */}
        <ul className="list-none p-0 grid grid-cols-2 auto-rows-[4.5rem] gap-x-4 gap-y-8 pb-4">
          {blocks.map((block) => (
            <SortableTile
              key={block.id}
              block={block}
              isTarget={block.id === overId}
              onResize={(size) => handleResize(block.id, size)}
            />
          ))}
        </ul>
      </SortableContext>

      {/* Copie du bloc qui suit le pointeur ou le doigt. */}
      <DragOverlay>
        {activeBlock ? (
          <div className="pointer-events-none h-full scale-105 shadow-2xl rounded-[2rem]">
            <BlockView block={activeBlock} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
