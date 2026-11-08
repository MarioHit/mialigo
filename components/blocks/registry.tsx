import {
  blockAlign,
  type Block,
  type BlockAlign,
  type BlockProps,
  type BlockSize,
  type BlockType,
} from "@/lib/blocks";
import type { ComponentType } from "react";
import LinkCard from "./link-card";

/**
 * Registre type → composant. Ajouter un type de bloc : l'ajouter à
 * BLOCK_TYPES (lib/blocks.ts) et à la contrainte SQL, créer son composant
 * dans ce dossier et l'enregistrer ici (TypeScript signale un type oublié).
 */
const registry: Record<BlockType, ComponentType<BlockProps>> = {
  link: LinkCard,
};

/** Rend un bloc avec le composant de son type. */
export function BlockView({ block }: { block: Block }) {
  const Component = registry[block.type];
  return Component ? <Component block={block} /> : null;
}

/**
 * Place de chaque taille dans la grille à 2 colonnes : petit 1×1, large 2×1,
 * grand 2×2. Classes écrites en entier pour que Tailwind les détecte.
 */
export const BLOCK_SIZE_CLASSES: Record<BlockSize, string> = {
  small: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  large: "col-span-2 row-span-2",
};

/** Libellés des tailles, pour le dashboard. */
export const BLOCK_SIZE_LABELS: Record<BlockSize, string> = {
  small: "Petit",
  wide: "Large",
  large: "Grand",
};

/**
 * Position d'un petit bloc : gauche (1re colonne), droite (2e colonne) ou
 * centre (ligne entière, largeur d'un petit bloc, centré). Sans position, le
 * bloc prend la prochaine case libre.
 */
const BLOCK_ALIGN_CLASSES: Record<BlockAlign, string> = {
  start: "col-start-1",
  center: "col-span-2 justify-self-center w-[calc(50%-0.5rem)]",
  end: "col-start-2",
};

export const BLOCK_ALIGN_LABELS: Record<BlockAlign, string> = {
  start: "Gauche",
  center: "Centre",
  end: "Droite",
};

export const BLOCK_ALIGN_ICONS: Record<BlockAlign, string> = {
  start: "fa-solid fa-align-left",
  center: "fa-solid fa-align-center",
  end: "fa-solid fa-align-right",
};

/** Classes de placement d'un bloc dans la grille (taille, puis position). */
export function blockGridClass(block: Block): string {
  const align = blockAlign(block);
  return align
    ? `${BLOCK_SIZE_CLASSES[block.size]} ${BLOCK_ALIGN_CLASSES[align]}`
    : BLOCK_SIZE_CLASSES[block.size];
}

/**
 * Grille « bento » des blocs d'une page, strictement dans l'ordre reçu : un petit
 * bloc suivi d'un bloc large reste seul sur sa ligne (pas de remplissage
 * « dense », qui remontait le petit bloc suivant à côté, cf. ADR-0019).
 */
export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <ul className="list-none p-0 grid grid-cols-2 auto-rows-[4.5rem] gap-4">
      {blocks.map((block) => (
        <li key={block.id} className={blockGridClass(block)}>
          <BlockView block={block} />
        </li>
      ))}
    </ul>
  );
}
