import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserInfo } from "@/features/auth/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserInitials(user: UserInfo | null | undefined): string {
  if (user?.fullName) {
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  if (user?.email) {
    return user.email[0].toUpperCase()
  }
  return "U"
}
