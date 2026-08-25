export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Utilisateur introuvable</p>
      <a
        href="/"
        className="px-6 py-3 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-colors"
      >
        Retour à l'accueil
      </a>
    </div>
  );
}
