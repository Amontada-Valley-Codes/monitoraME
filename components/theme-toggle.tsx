"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        !event.repeat &&
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "d"
      ) {
        event.preventDefault()
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [resolvedTheme, setTheme])

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={toggleTheme}
      aria-label="Alternar entre tema claro e escuro"
      aria-keyshortcuts="Control+Shift+D"
      title="Alternar tema (Ctrl + Shift + D)"
      className="no-print fixed right-4 bottom-4 z-40 size-11 rounded-full border-border bg-card/90 shadow-lg backdrop-blur-sm hover:bg-muted"
    >
      <Moon aria-hidden="true" className="dark:hidden" />
      <Sun aria-hidden="true" className="hidden dark:block" />
    </Button>
  )
}
