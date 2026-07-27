'use client'

import { createContext, useContext } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Light-only mode — theme switching removed from the landing page.
// ThemeContext is kept minimal so internal app pages that may need it still compile.

export type Theme = 'light'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      storageKey="cg-theme"
      disableTransitionOnChange
    >
      <ThemeContext.Provider value={{ theme: 'light', resolvedTheme: 'light', setTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
