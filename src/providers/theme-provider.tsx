import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type PropsWithChildren,
} from "react";
import { useColorScheme as useSystemColorScheme } from "../hooks/use-color-scheme";

import { Colors } from "../constants/theme";

const THEME_KEY = "@jelajah_aman:theme";

export type ThemePreference = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
type ThemeColors = { [Key in keyof typeof Colors.light]: string };

interface ThemeContextValue {
  preference: ThemePreference;
  theme: ResolvedTheme;
  colors: ThemeColors;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useSystemColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");

  useEffect(() => {
    void AsyncStorage.getItem(THEME_KEY)
      .then((storedPreference) => {
        if (
          storedPreference === "light" ||
          storedPreference === "dark" ||
          storedPreference === "system"
        ) {
          setPreference(storedPreference);
        }
      })
      .catch(() => {});
  }, []);

  const theme: ResolvedTheme =
    preference === "system"
      ? systemColorScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  async function setThemePreference(nextPreference: ThemePreference) {
    setPreference(nextPreference);
    try {
      await AsyncStorage.setItem(THEME_KEY, nextPreference);
    } catch {
      // Keep the selected theme active for this session if persistence fails.
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        preference,
        theme,
        colors: Colors[theme],
        setThemePreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used inside ThemeProvider");
  }
  return context;
}
