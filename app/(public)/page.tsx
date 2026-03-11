import type { Metadata } from "next"
import { cookies } from "next/headers"
import { LandingPage } from "@/components/landing-page"
import { getTranslations } from "@/lib/i18n/translations"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"

const title = "Capo — Song library for musicians"
const description =
  "Organize your songs, chords, and setlists in one place. Built for worship teams and musicians who perform live."

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "Capo",
    locale: "en_US",
    type: "website",
    url: "https://capo.mfuentesg.dev"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description
  },
  metadataBase: new URL("https://capo.mfuentesg.dev")
}

export default async function Page() {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const locale = localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale
  const t = getTranslations(locale)

  return <LandingPage t={t} />
}
