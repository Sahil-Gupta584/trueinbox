import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { getTheme, setTheme, isDark, type Theme } from "../lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDark());
    // Re-sync when class changes (e.g. system preference fires)
    const observer = new MutationObserver(() => setDark(isDark()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next: Theme = dark ? "light" : "dark";
    setTheme(next);
    setDark(!dark);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-secondary text-muted-foreground hover:text-foreground ${className}`}
    >
      {dark
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
