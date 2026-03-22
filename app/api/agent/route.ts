import Anthropic from "@anthropic-ai/sdk"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"

export const runtime = "nodejs"
export const maxDuration = 60

type AgentMessage = {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: Request) {
  const body = (await request.json()) as { messages: AgentMessage[] }
  const messages = body.messages

  if (!messages?.length) {
    return Response.json({ error: "messages is required" }, { status: 400 })
  }

  // Derive MCP server URL from the incoming request origin
  const origin = new URL(request.url).origin
  const mcpUrl = new URL(`${origin}/api/mcp`)

  // Connect to our own MCP server to discover tools
  const mcpClient = new Client({ name: "capo-agent", version: "1.0.0" })
  const transport = new StreamableHTTPClientTransport(mcpUrl)
  await mcpClient.connect(transport)

  const { tools: mcpTools } = await mcpClient.listTools()

  // Convert MCP tool definitions to Anthropic format
  const tools: Anthropic.Tool[] = mcpTools.map((t) => ({
    name: t.name,
    description: t.description ?? "",
    input_schema: t.inputSchema as Anthropic.Tool["input_schema"],
  }))

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Build the conversation history in Anthropic format
      const history: Anthropic.MessageParam[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        // Agentic loop: keep going until no more tool calls
        while (true) {
          const apiStream = anthropic.messages.stream({
            model: "claude-opus-4-6",
            max_tokens: 4096,
            system:
              "You are a chord sheet assistant for the Capo app. " +
              "You help users find chord sheets from external platforms. " +
              "When a user asks for chords to a song, use the get_song_chords tool with a URL from " +
              "cifraclub.com.br, lacuerda.net, or ultimate-guitar.com. " +
              "If the user hasn't given you a URL, ask them to provide one or tell you which platform to search on. " +
              "Present the ChordPro lyrics in a clear, readable way.",
            tools,
            messages: history,
          })

          // Stream text deltas to the client
          apiStream.on("text", (delta) => {
            send({ type: "text", delta })
          })

          const message = await apiStream.finalMessage()

          if (message.stop_reason === "end_turn") break

          if (message.stop_reason !== "tool_use") break

          // Append assistant turn and execute tool calls
          history.push({ role: "assistant", content: message.content })

          const toolUseBlocks = message.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
          )

          const toolResults: Anthropic.ToolResultBlockParam[] = []

          for (const block of toolUseBlocks) {
            send({ type: "tool_call", name: block.name, input: block.input })

            const result = await mcpClient.callTool({
              name: block.name,
              arguments: block.input as Record<string, unknown>,
            })

            const content = result.content as Array<{ type: string; text?: string }>
            const resultText = content
              .filter((c) => c.type === "text")
              .map((c) => c.text ?? "")
              .join("\n")

            const isError = Boolean(result.isError)
            send({ type: "tool_result", name: block.name, isError })

            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: resultText,
              is_error: isError,
            })
          }

          history.push({ role: "user", content: toolResults })
        }

        send({ type: "done" })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error"
        send({ type: "error", message })
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
