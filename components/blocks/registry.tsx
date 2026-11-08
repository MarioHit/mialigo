import type { Block, BlockProps, BlockSize, BlockType } from "@/lib/blocks";
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
 * Grille « bento » des blocs d'une page, dans l'ordre reçu. grid-flow-row-dense
 * comble les trous laissés par un petit bloc isolé avec le petit bloc suivant.
 */
export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <ul className="list-none p-0 grid grid-cols-2 grid-flow-row-dense auto-rows-[4.5rem] gap-4">
      {blocks.map((block) => (
        <li key={block.id} className={BLOCK_SIZE_CLASSES[block.size]}>
          <BlockView block={block} />
        </li>
      ))}
    </ul>
  );
}
