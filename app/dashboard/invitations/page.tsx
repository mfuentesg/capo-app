import type { Metadata } from "next"
import { PendingInvitationsClient } from "./pending-invitations-client"

export const metadata: Metadata = {
  title: "Pending Invitations",
  robots: { index: false, follow: false }
}

import { getTranslations } from "@/lib/i18n/translations"
import { cookies } from "next/headers"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import { createClient } from "@/lib/supabase/server"
import { getPendingInvitations as getPendingInvitationsApi } from "@/features/teams/api/teamsApi"

export default async function PendingInvitationsPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  const [t, initialInvitations] = await Promise.all([
    getTranslations(locale),
    getPendingInvitationsApi(supabase).catch(() => [])
  ])

  return <PendingInvitationsClient t={t} initialInvitations={initialInvitations} />
}
