// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const SITE_URL = Deno.env.get("SITE_URL") || "http://localhost:3000"

interface InvitationRequest {
  to: string
  teamName: string
  inviterName: string
  token: string
  role: string
}

const createInvitationEmail = (
  teamName: string,
  inviterName: string,
  acceptUrl: string,
  role: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h1 style="color: #1a1a1a; margin-top: 0; font-size: 24px;">You've been invited to join a team! 🎵</h1>
          <p style="font-size: 16px; color: #4a5568; margin-bottom: 20px;">
            <strong>${inviterName}</strong> has invited you to join <strong>${teamName}</strong> on Capo as a <strong>${role}</strong>.
          </p>
          <p style="font-size: 16px; color: #4a5568; margin-bottom: 30px;">
            Capo helps teams collaborate on music projects, manage playlists, and share songs together.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}"
               style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size: 14px; color: #718096; margin-top: 30px;">
            This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
          <p>Capo - Collaborative Music Management</p>
          <p style="margin-top: 10px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${acceptUrl}" style="color: #2563eb; word-break: break-all;">${acceptUrl}</a>
          </p>
        </div>
      </body>
    </html>
  `
}

const handler = async (request: Request): Promise<Response> => {
  try {
    // Validate API key
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    // Parse request body
    const body: InvitationRequest = await request.json()
    const { to, teamName, inviterName, token, role } = body

    // Validate required fields
    if (!to || !teamName || !inviterName || !token || !role) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, teamName, inviterName, token, role"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Create acceptance URL
    const acceptUrl = `${SITE_URL}/teams/accept-invitation?token=${token}`

    // Create email HTML
    const html = createInvitationEmail(teamName, inviterName, acceptUrl, role)

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "capo@mfuentesg.dev",
        to,
        subject: `You've been invited to join ${teamName} on Capo`,
        html
      })
    })

    const data = await res.json()

    // Check if email was sent successfully
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to send email", details: data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Error sending invitation email:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}

Deno.serve(handler)
