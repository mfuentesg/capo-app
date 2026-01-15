import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date): string {
  return new Date(date).toLocaleDateString()
}

/**
 * Format a date as a long date string using native Intl.DateTimeFormat
 * Equivalent to date-fns format(date, "PPP") - e.g., "April 29th, 2021"
 */
export function formatLongDate(date: Date, locale: string = "en"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date)
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
