import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns up to 2 uppercase initials from a display name or email.
 * Falls back to the first character of each space-separated word.
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parse date values while preserving YYYY-MM-DD as a local calendar date.
 * Native Date parsing treats date-only strings as UTC, which can shift a day by timezone.
 */
export function parseDateValue(date: string | number | Date): Date {
  if (typeof date === "string" && DATE_ONLY_REGEX.test(date)) {
    const [year, month, day] = date.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  return new Date(date)
}

export function formatDate(date: string | number | Date): string {
  if (typeof date === "string" && DATE_ONLY_REGEX.test(date)) {
    return parseDateValue(date).toLocaleDateString()
  }
  // For full timestamps, pin to the UTC calendar date so server and client render
  // the same value regardless of the local timezone (avoids hydration mismatches).
  const parsed = new Date(date)
  const utcDate = new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  return utcDate.toLocaleDateString()
}

/**
 * Format a date as a long date string using native Intl.DateTimeFormat
 * Equivalent to date-fns format(date, "PPP") - e.g., "April 29th, 2021"
 */
export function formatLongDate(date: string | number | Date, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(parseDateValue(date))
}

/**
 * Format a date as yyyy-MM-dd using native date methods
 * Equivalent to date-fns format(date, "yyyy-MM-dd")
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
