import type { BlockProps } from "@/lib/blocks";

/** Bloc « link » : carte cliquable avec icône Font Awesome et titre. */
export default function LinkCard({ block }: BlockProps) {
  return (
    <a
      href={block.url}
      className="block-card flex items-center px-5 py-4 rounded-full border no-underline font-medium w-full transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i
        className={`${block.icon} mr-4 text-xl w-6 text-center`}
        aria-hidden="true"
      ></i>
      {block.title}
    </a>
  );
}
