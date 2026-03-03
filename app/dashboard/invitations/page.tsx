import type { Metadata } from "next"
import { PendingInvitationsClient } from "./pending-invitations-client"

export const metadata: Metadata = {
  title: "Pending Invitations",
  robots: { index: false, follow: false }
}

export default function PendingInvitationsPage() {
  return <PendingInvitationsClient />
}
