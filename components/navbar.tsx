"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Music, ListMusic, Settings, LogOut, Menu, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"
import { useLocale } from "@/contexts/locale-context"
import type { Locale } from "@/lib/i18n/config"

export function Navbar() {
  const pathname = usePathname()
  const { t, locale, setLocale } = useLocale()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const languages = [
    { code: "en" as Locale, label: "English" },
    { code: "es" as Locale, label: "Español" }
  ]

  const navItems = [
    { title: t.nav.songs, href: "/dashboard/songs", icon: Music },
    { title: t.nav.playlists, href: "/dashboard/playlists", icon: ListMusic }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="left">
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-64">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Image
                  src="/img/capo-text.svg"
                  alt="Capo Logo"
                  width={80}
                  height={27}
                  className="dark:invert"
                />
              </DrawerTitle>
            </DrawerHeader>
            <nav className="mt-8 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsDrawerOpen(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn("w-full justify-start gap-3", isActive && "font-medium")}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </DrawerContent>
        </Drawer>

        <Link href="/dashboard" className="mr-6 flex items-center lg:mr-8">
          <Image
            src="/img/capo-text.svg"
            alt="Capo Logo"
            width={80}
            height={24}
            className="dark:invert"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("gap-2 rounded-full", isActive && "font-medium")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-9 px-2">
                <Languages className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://ui.shadcn.com/avatars/01.png" alt="MF" />
                  <AvatarFallback>MF</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Marcelo Fuentes</p>
                  <p className="text-xs leading-none text-muted-foreground">me@mfuentesg.dev</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t.nav.settings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                {t.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
