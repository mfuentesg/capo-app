import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

export const runtime = "nodejs"
export const maxDuration = 60

// ---------------------------------------------------------------------------
// Cloudflare Workers AI — OpenAI-compatible types (subset)
// ---------------------------------------------------------------------------

type CFMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: CFToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string }

type CFToolCall = {
  id: string
  type: "function"
  function: { name: string; arguments: string }
}

type CFTool = {
  type: "function"
  function: { name: string; description: string; parameters: unknown }
}

type CFResponse = {
  result: {
    choices: Array<{
      message: {
        role: string
        content: string | null
        tool_calls?: CFToolCall[]
      }
      finish_reason: string
    }>
  }
}

// Default to llama-3.1-8b — free tier, supports tool use.
// Override via CLOUDFLARE_AI_MODEL env var (e.g. @cf/meta/llama-3.3-70b-instruct-fp8-fast).
const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct"

async function cfChat(
  messages: CFMessage[],
  tools: CFTool[]
): Promise<{ content: string | null; toolCalls: CFToolCall[]; finishReason: string }> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const model = process.env.CLOUDFLARE_AI_MODEL ?? DEFAULT_MODEL

  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN env vars")
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        tools: tools.length > 0 ? tools : undefined,
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudflare AI error ${res.status}: ${text}`)
  }

  const data = (await res.json()) as CFResponse
  const choice = data.result.choices[0]

  return {
    content: choice.message.content,
    toolCalls: choice.message.tool_calls ?? [],
    finishReason: choice.finish_reason,
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

type AgentMessage = { role: "user" | "assistant"; content: string }

export async function POST(request: Request) {
  const body = (await request.json()) as { messages: AgentMessage[] }
  const messages = body.messages

  if (!messages?.length) {
    return Response.json({ error: "messages is required" }, { status: 400 })
  }

  // Connect to our MCP server running in the same Next.js app
  const origin = new URL(request.url).origin
  const mcpClient = new Client({ name: "capo-agent", version: "1.0.0" })
  await mcpClient.connect(new StreamableHTTPClientTransport(new URL(`${origin}/api/mcp`)))

  const { tools: mcpTools } = await mcpClient.listTools()

  // Convert MCP tool definitions → OpenAI function-call format
  const tools: CFTool[] = mcpTools.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description ?? "",
      parameters: t.inputSchema,
    },
  }))

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const history: CFMessage[] = [
        {
          role: "system",
          content:
            "You are a chord sheet assistant for the Capo app. " +
            "Use the get_song_chords tool to fetch chord sheets from CifraClub, LaCuerda, or Ultimate Guitar. " +
            "Ask the user for a song URL if they haven't provided one.",
        },
        ...messages.map((m) => ({ role: m.role, content: m.content }) as CFMessage),
      ]

      try {
        while (true) {
          const { content, toolCalls, finishReason } = await cfChat(history, tools)

          if (content) {
            send({ type: "text", delta: content })
          }

          if (finishReason !== "tool_calls" || toolCalls.length === 0) break

          history.push({ role: "assistant", content, tool_calls: toolCalls })

          for (const tc of toolCalls) {
            send({ type: "tool_call", name: tc.function.name })

            let args: Record<string, unknown> = {}
            try {
              args = JSON.parse(tc.function.arguments) as Record<string, unknown>
            } catch {
              // leave empty — callTool will surface the error
            }

            const result = await mcpClient.callTool({ name: tc.function.name, arguments: args })

            const resultText = (result.content as Array<{ type: string; text?: string }>)
              .filter((c) => c.type === "text")
              .map((c) => c.text ?? "")
              .join("\n")

            send({ type: "tool_result", name: tc.function.name, isError: Boolean(result.isError) })

            history.push({ role: "tool", tool_call_id: tc.id, content: resultText })
          }
        }

        send({ type: "done" })
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" })
      } finally {
        await mcpClient.close()
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
