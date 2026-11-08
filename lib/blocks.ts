// Modèle de blocs (#16) : chaque ligne de public.links est un bloc typé.
// Les types et tailles doivent rester synchronisés avec les contraintes CHECK
// de supabase-blocks.sql (et supabase-auth-clean.sql).

export const BLOCK_TYPES = ["link"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

/** Tailles de la grille (#18) : petit 1×1, large 2×1, grand 2×2. */
export const BLOCK_SIZES = ["small", "wide", "large"] as const;
export type BlockSize = (typeof BLOCK_SIZES)[number];

export interface Block {
  id: string;
  type: BlockType;
  /** Colonnes communes, utilisées par le bloc « link ». */
  title: string;
  url: string;
  icon: string;
  /** Données propres au type (objet JSON). */
  data: Record<string, unknown>;
  size: BlockSize;
  order: number;
}

/** Colonnes lues pour afficher ou éditer les blocs (jamais `select("*")`). */
export const BLOCK_COLUMNS = "id, type, title, url, icon, data, size, order";

/** Props reçues par chaque composant de bloc du registre. */
export interface BlockProps {
  block: Block;
}

function isBlockType(value: unknown): value is BlockType {
  return BLOCK_TYPES.includes(value as BlockType);
}

function isBlockSize(value: unknown): value is BlockSize {
  return BLOCK_SIZES.includes(value as BlockSize);
}

/**
 * Normalise une ligne lue en base. Renvoie null pour un type inconnu de ce
 * code (ex. bloc ajouté par une version plus récente) : il n'est pas affiché.
 */
export function toBlock(row: Record<string, unknown>): Block | null {
  if (!isBlockType(row.type)) return null;
  const data =
    row.data && typeof row.data === "object" && !Array.isArray(row.data)
      ? (row.data as Record<string, unknown>)
      : {};
  return {
    id: String(row.id),
    type: row.type,
    title: typeof row.title === "string" ? row.title : "",
    url: typeof row.url === "string" ? row.url : "",
    icon: typeof row.icon === "string" ? row.icon : "",
    data,
    size: isBlockSize(row.size) ? row.size : "small",
    order: typeof row.order === "number" ? row.order : 0,
  };
}

export function toBlocks(rows: Record<string, unknown>[] | null): Block[] {
  return (rows ?? []).flatMap((row) => {
    const block = toBlock(row);
    return block ? [block] : [];
  });
}
