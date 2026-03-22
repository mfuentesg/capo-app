# Chord Assistant — Architecture

The Chord Assistant is an AI-powered chat feature that looks up guitar chords
for any song by scraping external chord platforms. This document describes the
end-to-end data flow.

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER (Browser)                           │
│        /dashboard/chord-assistant  (Next.js page)               │
│                  Chat UI — React client component               │
└────────────────────────┬────────────────────────────────────────┘
                         │ POST /api/agent  { messages }
                         │ ◄── SSE stream (text delta, tool_call,
                         │                 tool_result, done)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VERCEL  (Next.js App)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  app/api/agent/route.ts          "Agent layer"           │   │
│  │                                                          │   │
│  │  1. Creates MCP client                                   │   │
│  │  2. Connects to /api/[transport] → listTools()           │   │
│  │  3. Sends messages + tools to Cloudflare AI              │   │
│  │  4. On tool_calls → callTool() → feeds result back       │   │
│  │  5. Loops until finish_reason = "stop"                   │   │
│  │  6. SSE-streams everything to the browser                │   │
│  └───────────┬─────────────────────────────┬────────────────┘   │
│              │ HTTP (same process)          │ HTTPS              │
│              ▼                             ▼                    │
│  ┌───────────────────────┐    ┌────────────────────────────┐    │
│  │ app/api/[transport]/  │    │   api.cloudflare.com       │    │
│  │   route.ts            │    │   /accounts/{id}/ai/v1/    │    │
│  │                       │    │   chat/completions         │    │
│  │  "MCP Server layer"   │    │                            │    │
│  │  get_song_chords tool │    │  Model: llama-3.1-8b       │    │
│  └───────────┬───────────┘    └────────────────────────────┘    │
│              │ fetch()              Cloudflare Workers AI        │
└──────────────┼──────────────────────────────────────────────────┘
               │
               ▼  Public internet (server-side fetch)
  ┌────────────────────────────────────────────────┐
  │         External Chord Platforms               │
  │                                                │
  │  cifraclub.com.br   lacuerda.net               │
  │  ultimate-guitar.com                           │
  │                                                │
  │  → HTML scraped → ChordPro converted           │
  └────────────────────────────────────────────────┘
```

## Request lifecycle

1. The user sends a message from the chat UI → `POST /api/agent`.
2. The **agent route** connects to the **MCP server** (`/api/[transport]`) via
   the MCP client and fetches the list of available tools (`listTools()`).
3. The agent calls **Cloudflare Workers AI** (free tier) with the conversation
   history and the tool definitions.
4. Llama decides to call `get_song_chords(url)` → the agent routes the
   invocation back to the MCP server via `callTool()`.
5. The MCP server fetches the external chord website, scrapes the HTML, and
   converts the result to ChordPro format.
6. The tool result is fed back to Cloudflare AI, which generates the final
   natural-language response.
7. The agent streams all events (text deltas, tool calls, tool results, done)
   back to the browser as **Server-Sent Events**.

## Key files

| Path | Role |
|---|---|
| `app/(app)/dashboard/chord-assistant/page.tsx` | Next.js page — renders the chat UI |
| `app/api/agent/route.ts` | Agent loop — MCP client + Cloudflare AI calls + SSE streaming |
| `app/api/[transport]/route.ts` | MCP server — exposes `get_song_chords` tool |
