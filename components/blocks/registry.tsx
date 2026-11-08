import type { Block, BlockProps, BlockType } from "@/lib/blocks";
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

/** Liste des blocs d'une page, dans l'ordre reçu. */
export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <ul className="list-none p-0 flex flex-col gap-4">
      {blocks.map((block) => (
        <li key={block.id}>
          <BlockView block={block} />
        </li>
      ))}
    </ul>
  );
}
