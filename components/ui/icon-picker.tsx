"use client"

import * as React from "react"
import { useToggle } from "@uidotdev/usehooks"
import {
  Music,
  Music2,
  Music3,
  Music4,
  Mic,
  Mic2,
  Guitar,
  Drum,
  Piano,
  Headphones,
  Radio,
  Disc,
  Disc3,
  Album,
  Users,
  Users2,
  User,
  UserCircle,
  Star,
  Heart,
  Trophy,
  Award,
  Medal,
  Crown,
  Zap,
  Flame,
  Sparkles,
  Sparkle,
  Rocket,
  Target,
  Shield,
  ShieldCheck,
  Sword,
  Gem,
  Diamond,
  LayoutGrid,
  Settings,
  Settings2,
  Globe,
  Globe2,
  Lock,
  Flag,
  MapPin,
  Compass,
  Mountain,
  Calendar,
  Clock,
  Briefcase,
  Home,
  Building,
  Building2,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Leaf,
  Flower2,
  Coffee,
  Book,
  BookOpen,
  Palette,
  Lightbulb,
  Bell,
  Gift,
  Camera,
  Film,
  Gamepad2,
  Puzzle,
  Anchor,
  Ship,
  Umbrella,
  Smile,
  Ghost,
  Cat,
  Dog,
  Bird,
  Fish,
  Waves,
  CheckCircle2,
  AlertCircle,
  LucideIcon
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export const TEAM_ICONS: Record<string, LucideIcon> = {
  // Music & Audio
  Music,
  Music2,
  Music3,
  Music4,
  Mic,
  Mic2,
  Guitar,
  Drum,
  Piano,
  Headphones,
  Radio,
  Disc,
  Disc3,
  Album,

  // People & Teams
  Users,
  Users2,
  User,
  UserCircle,

  // Achievement & Success
  Star,
  Trophy,
  Award,
  Medal,
  Crown,
  Target,
  CheckCircle2,

  // Energy & Power
  Heart,
  Zap,
  Flame,
  Sparkles,
  Sparkle,
  Rocket,
  Lightbulb,

  // Protection & Strength
  Shield,
  ShieldCheck,
  Sword,

  // Precious & Special
  Gem,
  Diamond,
  Gift,

  // Organization & Tools
  LayoutGrid,
  Settings,
  Settings2,
  Briefcase,
  Book,
  BookOpen,
  Calendar,
  Clock,
  Bell,

  // Places & Navigation
  Globe,
  Globe2,
  MapPin,
  Compass,
  Mountain,
  Home,
  Building,
  Building2,

  // Nature & Weather
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Leaf,
  Flower2,
  Waves,

  // Activities & Hobbies
  Coffee,
  Palette,
  Camera,
  Film,
  Gamepad2,
  Puzzle,

  // Maritime & Adventure
  Anchor,
  Ship,
  Umbrella,

  // Fun & Playful
  Smile,
  Ghost,
  Cat,
  Dog,
  Bird,
  Fish,

  // Security & Status
  Lock,
  Flag,
  AlertCircle
}

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  disabled?: boolean
  iconClassName?: string
  triggerClassName?: string
}

export function IconPicker({
  value,
  onChange,
  disabled,
  iconClassName,
  triggerClassName
}: IconPickerProps) {
  const [open, toggleOpen] = useToggle(false)
  const contentId = React.useId()

  const selectedIconName = value && TEAM_ICONS[value] ? value : "Users"
  const SelectedIcon = TEAM_ICONS[selectedIconName] || Users

  return (
    <Popover open={open} onOpenChange={toggleOpen}>
      <PopoverTrigger asChild>
        <button
          role="combobox"
          aria-expanded={open}
          aria-controls={contentId}
          aria-label="Select team icon"
          disabled={disabled}
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-primary/10 border border-border hover:bg-primary/20 transition-colors p-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            triggerClassName
          )}
          title="Click to change icon"
        >
          <SelectedIcon className={iconClassName || "h-6 w-6"} />
          <span className="sr-only">{value || "Select an icon"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent id={contentId} className="w-140 p-0" align="start">
        <div className="h-120 p-4 overflow-y-auto">
          <div className="grid grid-cols-8 gap-3">
            {Object.entries(TEAM_ICONS).map(([name, Icon]) => (
              <Button
                key={name}
                variant="ghost"
                className={cn(
                  "h-12 w-12 p-0 flex items-center justify-center",
                  value === name && "bg-accent text-accent-foreground"
                )}
                onClick={() => {
                  onChange(name)
                  toggleOpen(false)
                }}
              >
                <Icon className="size-6" />
                <span className="sr-only">{name}</span>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TeamIcon({ icon, className }: { icon?: string | null; className?: string }) {
  const IconData = icon && TEAM_ICONS[icon] ? TEAM_ICONS[icon] : Users
  return <IconData className={cn("size-5", className)} />
}
