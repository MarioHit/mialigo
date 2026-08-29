import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  intro: string;
  children: ReactNode;
}

export default function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-20 dark:bg-gray-900 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 sm:p-10">
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Retour à l'accueil
        </Link>
        <header className="mt-8 border-b border-gray-200 pb-6 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">{intro}</p>
        </header>
        <div className="prose prose-gray mt-8 max-w-none dark:prose-invert">
          {children}
        </div>
        <nav className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-200 pt-6 text-sm dark:border-gray-700">
          <Link
            href="/mentions-legales"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Confidentialité
          </Link>
          <Link
            href="/cgu"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            CGU
          </Link>
          <Link
            href="/contact"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Contact
          </Link>
        </nav>
      </article>
    </main>
  );
}
