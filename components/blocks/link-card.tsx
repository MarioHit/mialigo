import type { BlockProps, BlockSize } from "@/lib/blocks";

/** Forme de la carte selon la taille du bloc dans la grille. */
const layout: Record<BlockSize, { card: string; icon: string; title: string }> =
  {
    // Ligne pleine largeur : l'apparence historique des liens.
    wide: {
      card: "flex-row px-5 rounded-full",
      icon: "mr-4 text-xl w-6",
      title: "truncate",
    },
    // Tuile d'une demi-largeur : icône au-dessus du titre.
    small: {
      card: "flex-col justify-center px-3 rounded-2xl text-sm",
      icon: "mb-1 text-xl",
      title: "w-full truncate",
    },
    // Grande tuile 2×2 : icône mise en avant.
    large: {
      card: "flex-col justify-center px-5 rounded-3xl text-lg",
      icon: "mb-3 text-4xl",
      title: "w-full line-clamp-2",
    },
  };

/** Bloc « link » : carte cliquable avec icône Font Awesome et titre. */
export default function LinkCard({ block }: BlockProps) {
  const style = layout[block.size];
  return (
    <a
      href={block.url}
      className={`block-card flex h-full w-full items-center border no-underline font-medium transition-all duration-200 hover:-translate-y-0.5 ${style.card}`}
      data-size={block.size}
      target="_blank"
      rel="noopener noreferrer"
    >
      <i
        className={`${block.icon} shrink-0 text-center ${style.icon}`}
        aria-hidden="true"
      ></i>
      <span className={`min-w-0 ${style.title}`}>{block.title}</span>
    </a>
  );
}
