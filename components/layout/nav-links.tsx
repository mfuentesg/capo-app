"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
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

        return (
          <Link key={item.href} href={item.href} onClick={onItemClick}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(baseClasses, isActive && "font-medium")}
            >
              <Icon className={variant === "horizontal" ? "h-4 w-4" : "h-5 w-5"} />
              {item.title}
            </Button>
          </Link>
        )
      })}
    </>
  )
}
