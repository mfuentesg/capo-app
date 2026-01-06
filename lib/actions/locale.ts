"use server"

import { cookies } from "next/headers"
import { isValidLocale, type Locale } from "@/lib/i18n/config"

export async function setLocaleAction(locale: Locale) {
  if (!isValidLocale(locale)) {
    throw new Error("Invalid locale")
  }

  const cookieStore = await cookies()
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })
}

