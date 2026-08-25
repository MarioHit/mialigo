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
    // Charger FontAwesome
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(link);

    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem("theme") || "light";
    setIsDarkMode(savedTheme === "dark");

    return () => {
      document.head.removeChild(link);
    };
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
      <style jsx global>{`
        :root {
          --bg-color: #f4f4f9;
          --text-color: #333;
          --link-bg: #ffffff;
          --link-hover: #eef2ff;
          --link-border: #ddd;
          --btn-bg: #e0e0e0;
          --btn-text: #333;
        }

        .dark-mode {
          --bg-color: #121212;
          --text-color: #f0f0f0;
          --link-bg: #1e1e1e;
          --link-hover: #2d2d2d;
          --link-border: #333;
          --btn-bg: #333;
          --btn-text: #f0f0f0;
        }

        body {
          font-family: "Segoe UI", sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          transition:
            background-color 0.4s ease,
            color 0.4s ease;
        }

        .container {
          width: 100%;
          max-width: 400px;
          text-align: center;
          padding: 20px;
        }

        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: var(--btn-bg);
          color: var(--btn-text);
          border: none;
          padding: 10px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          transform: scale(1.1);
        }

        .theme-toggle .fa-sun {
          display: none;
        }
        .theme-toggle .fa-moon {
          display: inline;
        }

        .dark-mode .theme-toggle .fa-sun {
          display: inline;
        }
        .dark-mode .theme-toggle .fa-moon {
          display: none;
        }

        .profile h1 {
          margin-bottom: 0.5rem;
        }
        .profile p {
          color: #666;
          margin-bottom: 2rem;
        }
        .dark-mode .profile p {
          color: #999;
        }

        .links-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .link-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          background-color: var(--link-bg);
          border: 1px solid var(--link-border);
          border-radius: 50px;
          text-decoration: none;
          color: var(--text-color);
          font-weight: 500;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .link-item i {
          margin-right: 15px;
          font-size: 1.2rem;
          width: 25px;
          text-align: center;
        }

        .link-item:hover {
          background-color: var(--link-hover);
          border-color: #6366f1;
          transform: translateY(-2px);
        }
      `}</style>

      <button className="theme-toggle" onClick={toggleTheme}>
        <i className="fa-solid fa-sun"></i>
        <i className="fa-solid fa-moon"></i>
      </button>

      <main className="container">
        <header className="profile">
          <h1>{config.name}</h1>
          <p>{config.bio}</p>
        </header>
        <nav>
          <ul className="links-list">
            {config.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  className="link-item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={link.icon}></i>
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
