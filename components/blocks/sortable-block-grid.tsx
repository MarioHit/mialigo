"use client";

// Grille des blocs en mode « Réorganiser » sur la page publique (#90).
// Chargée à la demande (next/dynamic) : les visiteurs ne téléchargent pas @dnd-kit.

import {
  blockAnnouncements,
  blockScreenReaderInstructions,
} from "@/lib/block-dnd";
import type { Block } from "@/lib/blocks";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
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
import { useState } from "react";
import { BLOCK_SIZE_CLASSES, BlockView } from "./registry";

/**
 * Pas de décalage calculé : les blocs ont des tailles différentes et la grille
 * est « dense ». L'ordre est mis à jour pendant le glisser (onDragOver), et
 * c'est la vraie grille qui se réarrange : on voit le rendu final en direct.
 */
const noTransform: SortingStrategy = () => null;

function SortableTile({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: block.id,
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      aria-label={`Déplacer ${block.title || "le bloc"}`}
      className={`${BLOCK_SIZE_CLASSES[block.size]} relative cursor-grab touch-manipulation select-none rounded-[2rem] outline-2 outline-dashed outline-offset-4 outline-indigo-400/70 focus-visible:outline-indigo-600 active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      {/* La carte ne réagit pas : un appui déplace le bloc, n'ouvre pas le lien. */}
      <div className="pointer-events-none h-full" aria-hidden="true">
        <BlockView block={block} />
      </div>
    </li>
  );
}

export default function SortableBlockGrid({
  blocks,
  onChange,
}: {
  blocks: Block[];
  /** Nouvel ordre, à chaque déplacement (non enregistré). */
  onChange: (blocks: Block[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Ordre au début du glisser, rétabli si l'utilisateur annule (Échap).
  const [orderAtStart, setOrderAtStart] = useState<Block[] | null>(null);

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

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setOrderAtStart(blocks);
  };

  const handleDragCancel = () => {
    if (orderAtStart) onChange(orderAtStart);
    setActiveId(null);
    setOrderAtStart(null);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.id === over.id) return;
    const from = blocks.findIndex((block) => block.id === active.id);
    const to = blocks.findIndex((block) => block.id === over.id);
    if (from !== -1 && to !== -1) onChange(arrayMove(blocks, from, to));
  };

  const activeBlock = blocks.find((block) => block.id === activeId);

  return (
    <DndContext
      id="page-reorganiser"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={() => {
        setActiveId(null);
        setOrderAtStart(null);
      }}
      onDragCancel={handleDragCancel}
      accessibility={{
        announcements: blockAnnouncements(blocks),
        screenReaderInstructions: blockScreenReaderInstructions,
      }}
    >
      <SortableContext
        items={blocks.map((block) => block.id)}
        strategy={noTransform}
      >
        <ul className="list-none p-0 grid grid-cols-2 grid-flow-row-dense auto-rows-[4.5rem] gap-4">
          {blocks.map((block) => (
            <SortableTile key={block.id} block={block} />
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
