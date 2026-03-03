import type { Metadata } from "next"
import { CreateTeamClient } from "@/features/teams"

export const metadata: Metadata = {
  title: "Create Team",
  robots: { index: false, follow: false }
}

export default function CreateTeamPage() {
  return <CreateTeamClient />
}
