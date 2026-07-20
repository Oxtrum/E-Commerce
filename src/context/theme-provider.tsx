import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type Theme = "dark" | "light" | "system"
type ResolvedTheme = Exclude<Theme, "system">

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "e-commerce-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme
  })

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (theme !== "system") return theme
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const syncSystemTheme = () => {
      document.documentElement.classList.toggle("dark", mediaQuery.matches)
      document.documentElement.classList.toggle("light", !mediaQuery.matches)
    }

    mediaQuery.addEventListener("change", syncSystemTheme)
    return () => mediaQuery.removeEventListener("change", syncSystemTheme)
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    localStorage.setItem(storageKey, nextTheme)
    setThemeState(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider")
  return context
}

