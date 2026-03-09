"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TransitionLink } from "@/components/transition-link"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavLinksProps {
  items: NavItem[]
  variant?: "horizontal" | "vertical"
  onItemClick?: () => void
}

export function NavLinks({ items, variant = "horizontal", onItemClick }: NavLinksProps) {
  const pathname = usePathname()

  const baseClasses = variant === "horizontal" ? "gap-2 rounded-full" : "w-full justify-start gap-3"

  return (
    <>
      {items.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        // Use TransitionLink only for the desktop horizontal nav — it is
        // never rendered inside an overlay, so view transitions are safe.
        // The mobile drawer uses a plain Link so that navigating from inside
        // the drawer never calls document.startViewTransition, which would
        // disrupt the drawer's close animation and leave it stuck in the DOM.
        const NavLink = variant === "horizontal" ? TransitionLink : Link

        return (
          <NavLink key={item.href} href={item.href} onClick={onItemClick}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(baseClasses, isActive && "font-medium")}
            >
              <Icon className={variant === "horizontal" ? "h-4 w-4" : "h-5 w-5"} />
              {item.title}
            </Button>
          </NavLink>
        )
      })}
    </>
  )
}
