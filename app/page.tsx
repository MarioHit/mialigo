import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="max-w-2xl w-full text-center">
        {/* Logo / Titre */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Mialigo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Votre lien unique pour tout partager
          </p>
        </div>

        {/* Description */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Créez votre page personnalisée et partagez tous vos liens en un seul
            endroit. Simple, élégant, et gratuit.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button className="px-8 py-4 bg-indigo-500 text-white rounded-full font-semibold hover:bg-indigo-600 transition-colors shadow-lg">
            Créer mon lien gratuitement
          </button>
          <Link
            href="/mario"
            className="px-8 py-4 border-2 border-indigo-500 text-indigo-500 rounded-full font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
          >
            Voir un exemple
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold mb-2">Design élégant</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interface moderne avec mode sombre
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Ultra rapide</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chargement instantané, 100% optimisé
            </p>
          </div>
          <div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Liens illimités</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Partagez autant de liens que vous voulez
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 text-sm text-gray-500">
        <p>Made with ❤️ by Mario • 2026</p>
      </footer>
    </div>
  );
}
