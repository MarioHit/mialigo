"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const config = {
    name: "Mario",
    bio: "Building in public 🚀",
    links: [
      {
        title: "Instagram",
        url: "https://www.instagram.com/muvunyi_1?igsh=MWZ6OXNtNHpoZ3RuZA==",
        icon: "fa-brands fa-instagram",
      },
      {
        title: "Youtube",
        url: "https://youtube.com/@mario-try-again?si=v7Nm_L8VYk1KXwdg",
        icon: "fa-brands fa-youtube",
      },
      {
        title: "Tiktok",
        url: "https://www.tiktok.com/@justdidit64?_r=1&_t=ZN-97vIqHhqkEA",
        icon: "fa-brands fa-tiktok",
      },
    ],
  };

  useEffect(() => {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem("theme") || "light";
    setIsDarkMode(savedTheme === "dark");
  }, []);

  useEffect(() => {
    // Appliquer le thème
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <button
        className="theme-toggle fixed top-5 right-5 p-2.5 rounded-full border-0 cursor-pointer text-xl transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-text)",
        }}
        onClick={toggleTheme}
      >
        <i className="fa-solid fa-sun"></i>
        <i className="fa-solid fa-moon"></i>
      </button>

      <main className="w-full max-w-md text-center p-5">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">{config.name}</h1>
          <p className="profile-bio text-[#666] mb-8">{config.bio}</p>
        </header>
        <nav>
          <ul className="list-none p-0 flex flex-col gap-4">
            {config.links.map((link, index) => (
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
      </main>
    </>
  );
}
