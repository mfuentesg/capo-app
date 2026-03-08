import type { Metadata } from "next"
import { LandingPage } from "@/components/landing-page"

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

export default function Page() {
  return <LandingPage />
}
