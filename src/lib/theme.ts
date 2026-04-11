// Theme management — respects system preference by default, persists user override

export type Theme = "light" | "dark" | "system";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme) || "system";
}

export function setTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

export function initTheme() {
  applyTheme(getTheme());
  // Watch system preference changes
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getTheme() === "system") applyTheme("system");
  });
}

export function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}
