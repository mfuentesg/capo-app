import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Tables } from "@/lib/supabase/database.types"

interface InvitationWithRelations extends Tables<"team_invitations"> {
  team: { name: string } | null
  inviter: { full_name: string | null; email: string | null } | null
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("team_invitations")
      .select(
        `
        *,
        team:teams(name),
        inviter:profiles(full_name, email)
      `
      )
      .eq("email", user.email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch invitations error:", error)
      throw error
    }

    const invitations = (data ?? []) as unknown as InvitationWithRelations[]
    const formattedInvitations = invitations.map((inv) => ({
      ...inv,
      teamName: inv.team?.name ?? null,
      inviterName: inv.inviter?.full_name ?? inv.inviter?.email ?? "A team member"
    }))

    return NextResponse.json(formattedInvitations)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}
