// Modèle de blocs (#16) : chaque ligne de public.links est un bloc typé.
// Les types et tailles doivent rester synchronisés avec les contraintes CHECK
// de supabase-blocks.sql (et supabase-auth-clean.sql).

export const BLOCK_TYPES = ["link"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

/** Tailles de la grille (#18) : petit 1×1, large 2×1, grand 2×2. */
export const BLOCK_SIZES = ["small", "wide", "large"] as const;
export type BlockSize = (typeof BLOCK_SIZES)[number];

/**
 * Position d'un petit bloc dans sa ligne, stockée dans data.align (aucune
 * colonne dédiée). Sans valeur : placement automatique (prochaine case libre).
 */
export const BLOCK_ALIGNS = ["start", "center", "end"] as const;
export type BlockAlign = (typeof BLOCK_ALIGNS)[number];

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

/** Position choisie d'un petit bloc ; null = automatique (ou bloc non petit). */
export function blockAlign(block: Block): BlockAlign | null {
  if (block.size !== "small") return null;
  const align = block.data.align;
  return BLOCK_ALIGNS.includes(align as BlockAlign)
    ? (align as BlockAlign)
    : null;
}

/**
 * Copie du bloc avec une clé de data modifiée (null : clé supprimée). Les
 * autres clés sont conservées.
 */
export function withData(
  block: Block,
  key: string,
  value: string | null,
): Block {
  const data = { ...block.data };
  if (value === null) delete data[key];
  else data[key] = value;
  return { ...block, data };
}

/** Copie du bloc avec une nouvelle position (null : automatique). */
export function withAlign(block: Block, align: BlockAlign | null): Block {
  return withData(block, "align", align);
}

/**
 * Forme d'un bloc (#20), stockée dans data.shape. Sans valeur : l'arrondi du
 * thème de la page (#19).
 */
export const BLOCK_SHAPES = ["square", "circle", "octagon", "hexagon"] as const;
export type BlockShape = (typeof BLOCK_SHAPES)[number];

/** Formes découpées par clip-path (double couche pour la bordure). */
export const CLIPPED_SHAPES: readonly BlockShape[] = ["octagon", "hexagon"];

/** Forme choisie ; null = forme du thème. */
export function blockShape(block: Block): BlockShape | null {
  const shape = block.data.shape;
  return BLOCK_SHAPES.includes(shape as BlockShape)
    ? (shape as BlockShape)
    : null;
}

export function withShape(block: Block, shape: BlockShape | null): Block {
  return withData(block, "shape", shape);
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
    size: isBlockSize(row.size) ? row.size : "wide",
    order: typeof row.order === "number" ? row.order : 0,
  };
}

export function toBlocks(rows: Record<string, unknown>[] | null): Block[] {
  return (rows ?? []).flatMap((row) => {
    const block = toBlock(row);
    return block ? [block] : [];
  });
}
