"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Music, Wrench } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

const WELCOME_CONTENT =
  "Hi! I can fetch chord sheets from CifraClub, LaCuerda, or Ultimate Guitar.\n\nPaste a song URL and I'll get the chords for you — e.g.:\nhttps://www.cifraclub.com.br/oasis/wonderwall/"

type MessageRole = "user" | "assistant"

interface Message {
  id: string
  role: MessageRole
  content: string
  toolCalls?: { name: string; input: unknown }[]
}

// "use client" pages can't export metadata — keep it in a layout or remove.
// export const metadata: Metadata = { title: "Chord Assistant" }

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Music className="h-4 w-4" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {message.toolCalls?.map((tc, i) => (
          <div key={i} className="mb-2 flex items-center gap-1.5 text-xs opacity-60">
            <Wrench className="h-3 w-3" />
            <span>
              {tc.name}({JSON.stringify(tc.input).slice(0, 60)}…)
            </span>
          </div>
        ))}
        <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
      </div>
    </div>
  )
}

export default function ChordAssistantPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: WELCOME_CONTENT },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    // Placeholder for the assistant response being streamed
    const assistantId = crypto.randomUUID()
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", toolCalls: [] },
    ])

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.body) throw new Error("No response body")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const raw = line.slice(6)
          if (raw === "[DONE]") break

          try {
            const event = JSON.parse(raw) as {
              type: string
              delta?: string
              name?: string
              input?: unknown
              message?: string
            }

            setMessages((prev) =>
              prev.map((m) => {
                if (m.id !== assistantId) return m
                if (event.type === "text" && event.delta) {
                  return { ...m, content: m.content + event.delta }
                }
                if (event.type === "tool_call" && event.name) {
                  return {
                    ...m,
                    toolCalls: [...(m.toolCalls ?? []), { name: event.name, input: event.input }],
                  }
                }
                if (event.type === "error") {
                  return { ...m, content: `Error: ${event.message}` }
                }
                return m
              })
            )
          } catch {
            // ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Failed to connect to agent: ${err instanceof Error ? err.message : "Unknown error"}` }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-2xl flex-col gap-0 px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">{t.chordAssistant.title}</h1>
        <p className="text-sm text-muted-foreground">{t.chordAssistant.subtitle}</p>
      </div>

      {/* Message list */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && messages.at(-1)?.content === "" && (
          <div className="flex justify-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={t.chordAssistant.placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
