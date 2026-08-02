export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "capitalai-theme";

export function getStoredTheme(): Theme {
  try {
    const stored =
      localStorage.getItem(THEME_STORAGE_KEY) ?? localStorage.getItem("trademetria-theme");
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", theme === "light" ? "#F4F3F3" : "#050202");

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}
