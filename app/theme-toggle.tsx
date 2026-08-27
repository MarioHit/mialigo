"use client";

import { useEffect, useSyncExternalStore } from "react";

const getTheme = () => {
  if (typeof window === "undefined") return false;

  const savedTheme = localStorage.getItem("theme");
  return savedTheme
    ? savedTheme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const subscribeToTheme = (onThemeChange: () => void) => {
  window.addEventListener("storage", onThemeChange);
  window.addEventListener("themechange", onThemeChange);

  return () => {
    window.removeEventListener("storage", onThemeChange);
    window.removeEventListener("themechange", onThemeChange);
  };
};

export default function ThemeToggle() {
  const isDarkMode = useSyncExternalStore(
    subscribeToTheme,
    getTheme,
    () => false,
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <button
      className="theme-toggle fixed top-5 right-5 z-10 p-2.5 rounded-full border-0 cursor-pointer text-xl transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: "var(--btn-bg)",
        color: "var(--btn-text)",
      }}
      onClick={toggleTheme}
      aria-label={
        isDarkMode ? "Activer le thème clair" : "Activer le thème sombre"
      }
    >
      <i className="fa-solid fa-sun"></i>
      <i className="fa-solid fa-moon"></i>
    </button>
  );
}
