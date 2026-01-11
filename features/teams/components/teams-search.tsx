"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

interface TeamsSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TeamsSearch({ value, onChange, placeholder = "Search teams..." }: TeamsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 h-10 bg-muted/50"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
