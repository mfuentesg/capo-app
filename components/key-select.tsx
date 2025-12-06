import { memo } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { MUSICAL_KEYS } from "@/lib/constants"

interface KeySelectProps {
  value?: string
  id?: string
  className?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export const KeySelect = memo(function KeySelect({
  value,
  id,
  className,
  onValueChange,
  placeholder = "Select key"
}: KeySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className={cn("w-full shadow-none", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-fit max-h-[300px]">
        <SelectGroup>
          {MUSICAL_KEYS.map((key) => (
            <SelectItem value={key} key={key}>
              {key}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
})
