import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "dark" | "light";

interface Settings {
  theme: Theme;
  sidebarWidth: number;
  editorWidth: "narrow" | "normal" | "wide";
  fontSize: "small" | "medium" | "large";
  showWordCount: boolean;
  typewriterScrolling: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  sidebarWidth: 260,
  editorWidth: "normal",
  fontSize: "medium",
  showWordCount: true,
  typewriterScrolling: false,
};

interface ThemeContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("scaled-settings");
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem("scaled-settings", JSON.stringify(settings));
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const setTheme = (t: Theme) => updateSettings({ theme: t });

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, theme: settings.theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
