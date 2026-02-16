"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { useLocale } from "@/features/settings"
import type { Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"
import { createOverlayIds } from "@/lib/ui/stable-overlay-ids"

const languages = [
  { code: "en" as Locale, label: "English" },
  { code: "es" as Locale, label: "Español" }
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const menuIds = createOverlayIds("navbar-language-menu")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 h-9 px-2"
          id={menuIds.triggerId}
          aria-controls={menuIds.contentId}
        >
          <Languages className="h-4 w-4" />
          <span className="text-xs font-medium uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" id={menuIds.contentId} aria-labelledby={menuIds.triggerId}>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={cn(locale === lang.code && "bg-accent")}
          >
            <span className="text-xs font-medium uppercase mr-2">{lang.code}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
