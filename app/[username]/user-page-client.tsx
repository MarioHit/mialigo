"use client";

import Link from "next/link";

interface UserData {
  name: string;
  bio: string;
  links: Array<{ title: string; url: string; icon: string }>;
}

interface UserPageClientProps {
  userData: UserData;
}

export default function UserPageClient({ userData }: UserPageClientProps) {
  return (
    <>
      {/* Bouton retour accueil */}
      <Link
        href="/"
        className="fixed top-5 left-5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-sm border"
        style={{
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-text)",
          borderColor: "var(--link-border)",
        }}
        aria-label="Retour à l'accueil"
      >
        <span>← Accueil</span>
      </Link>

      <main className="w-full max-w-md text-center p-5">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">{userData.name}</h1>
          <p className="profile-bio text-[#666] mb-8">{userData.bio}</p>
        </header>
        <nav>
          <ul className="list-none p-0 flex flex-col gap-4">
            {userData.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="flex items-center px-5 py-4 rounded-full border no-underline font-medium w-full transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500"
                  style={{
                    backgroundColor: "var(--link-bg)",
                    borderColor: "var(--link-border)",
                    color: "var(--text-color)",
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--link-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--link-bg)";
                  }}
                >
                  <i
                    className={`${link.icon} mr-4 text-xl w-6 text-center`}
                  ></i>
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="mt-8 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: "var(--text-color)" }}
          >
            <span>
              Créé avec <strong className="font-semibold">Mialigo</strong>
            </span>
          </Link>
        </footer>
      </main>
    </>
  );
}
