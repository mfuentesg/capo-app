"use client"

import { Lightbulb, LightbulbOff } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Lightbulb className="h-[1.2rem] w-[1.2rem] transition-all text-amber-500 dark:hidden" />
      <LightbulbOff className="h-[1.2rem] w-[1.2rem] transition-all text-slate-400 hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
