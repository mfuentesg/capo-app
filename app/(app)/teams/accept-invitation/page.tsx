import type { Metadata } from "next"
import { AcceptInvitationClient } from "./accept-invitation-client"

export const metadata: Metadata = {
  title: "Accept Team Invitation",
  robots: { index: false, follow: false }
}

export default function AcceptInvitationPage() {
  return <AcceptInvitationClient />
}
