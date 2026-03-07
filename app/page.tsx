import type { Metadata } from "next"
import { LandingPage } from "@/components/landing-page"

export const metadata: Metadata = {
  title: "Capo — Song library for musicians",
  description:
    "Your personal song library for practice and performance. Organize songs with chords and lyrics, build setlists, and collaborate with your band."
}

export default function Page() {
  return <LandingPage />
}
