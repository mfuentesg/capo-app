/**
 * Performance trace generator — captures a Chrome DevTools trace while
 * simulating a song-tap interaction on mobile.
 *
 * First-time setup (saves browser session so you only log in once):
 *   pnpm tsx scripts/perf-trace.ts --setup
 *   # A browser window opens — log in normally, then close it.
 *   # Session is saved to .perf-session.json
 *
 * Record a trace (reuses saved session):
 *   pnpm tsx scripts/perf-trace.ts
 *
 * Output:
 *   perf-trace-<timestamp>.json  (open in Chrome DevTools → Performance → Load profile)
 *
 * Options (env vars):
 *   URL=http://localhost:3000/dashboard/songs   target page
 *   SONG_SELECTOR=h4.my-selector               CSS selector for a song title
 *   OUT=./my-trace.json                        output path
 */

import { chromium } from "playwright"
import { writeFileSync, existsSync } from "fs"
import { join } from "path"

const TARGET_URL = process.env.URL ?? "http://localhost:3000/dashboard/songs"
const SONG_SELECTOR = process.env.SONG_SELECTOR ?? "h4.truncate"
const OUT = process.env.OUT ?? join(process.cwd(), `perf-trace-${Date.now()}.json`)
const SESSION_FILE = join(process.cwd(), ".perf-session.json")
const IS_SETUP = process.argv.includes("--setup")

// iPhone 12 Pro — matches the device used for the original trace
const DEVICE = {
  viewport: { width: 390, height: 844 },
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
}

const TRACE_CATEGORIES = [
  "-*",
  "devtools.timeline",
  "v8.execute",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-devtools.timeline.frame",
  "blink.user_timing",
  "latencyInfo",
  "disabled-by-default-v8.cpu_profiler",
  "disabled-by-default-devtools.timeline.invalidationTracking",
].join(",")

async function readStream(cdp: Awaited<ReturnType<typeof import("playwright").BrowserContext.prototype.newCDPSession>>, handle: string): Promise<string> {
  let result = ""
  let eof = false
  while (!eof) {
    const chunk = await cdp.send("IO.read", { handle, size: 65536 }) as { data: string; eof: boolean; base64Encoded?: boolean }
    if (chunk.base64Encoded) {
      result += Buffer.from(chunk.data, "base64").toString("utf8")
    } else {
      result += chunk.data
    }
    eof = chunk.eof
  }
  await cdp.send("IO.close", { handle })
  return result
}

async function setup() {
  console.log("Opening browser — log in normally, then close the window.")
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext(DEVICE)
  const page = await context.newPage()
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" })
  // Wait until user closes the browser
  await new Promise<void>((resolve) => browser.on("disconnected", resolve))
  const storage = await context.storageState()
  writeFileSync(SESSION_FILE, JSON.stringify(storage, null, 2))
  console.log(`Session saved to ${SESSION_FILE}`)
  console.log("Now run:  pnpm tsx scripts/perf-trace.ts")
}

async function run() {
  if (!existsSync(SESSION_FILE)) {
    console.error("No saved session found. Run setup first:")
    console.error("  pnpm tsx scripts/perf-trace.ts --setup")
    process.exit(1)
  }

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({ ...DEVICE, storageState: SESSION_FILE })
  const page = await context.newPage()
  const cdp = await context.newCDPSession(page)

  console.log(`Navigating to ${TARGET_URL}…`)
  await page.goto(TARGET_URL, { waitUntil: "networkidle" })

  const currentUrl = page.url()
  if (!currentUrl.includes("songs")) {
    console.error(`Redirected to: ${currentUrl} — session may have expired.`)
    console.error("Re-run setup:  pnpm tsx scripts/perf-trace.ts --setup")
    await browser.close()
    process.exit(1)
  }

  console.log(`Landed on: ${page.url()}`)

  // Wait for song items
  console.log(`Waiting for songs (selector: "${SONG_SELECTOR}")…`)
  try {
    await page.locator(SONG_SELECTOR).first().waitFor({ state: "visible", timeout: 10_000 })
  } catch {
    const bodyText = await page.locator("body").innerText().catch(() => "")
    console.error(`Selector "${SONG_SELECTOR}" not found. Page content preview:\n${bodyText.slice(0, 300)}`)
    await browser.close()
    process.exit(1)
  }

  // Settle before recording
  await page.waitForTimeout(800)

  // Start tracing
  console.log("Starting trace…")
  await cdp.send("Tracing.start", {
    categories: TRACE_CATEGORIES,
    transferMode: "ReturnAsStream",
  })

  // Tap the first song
  console.log("Tapping first song…")
  await page.locator(SONG_SELECTOR).first().tap()

  // Capture the sheet open + React render + animation
  await page.waitForTimeout(1_500)

  // Stop and collect trace
  console.log("Stopping trace and collecting events…")
  const raw = await new Promise<string>((resolve, reject) => {
    cdp.on("Tracing.tracingComplete", async (params: { stream?: string }) => {
      if (!params.stream) { resolve("[]"); return }
      try {
        resolve(await readStream(cdp, params.stream))
      } catch (e) {
        reject(e)
      }
    })
    cdp.send("Tracing.end").catch(reject)
  })

  await browser.close()

  // The CDP stream produces a JSON array of events
  let events: object[] = []
  try {
    const parsed = JSON.parse(raw)
    events = Array.isArray(parsed) ? parsed : (parsed.traceEvents ?? [])
  } catch {
    // Some Chrome versions wrap events differently — try stripping outer wrapper
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) {
      try { events = JSON.parse(match[0]) } catch { /* give up */ }
    }
  }

  console.log(`Collected ${events.length} trace events`)

  const output = { traceEvents: events, metadata: { source: "perf-trace.ts", url: URL } }
  writeFileSync(OUT, JSON.stringify(output))
  console.log(`\nTrace saved to: ${OUT}`)
  console.log("Open Chrome DevTools → Performance tab → ⬆ Load profile")
}

if (IS_SETUP) {
  setup().catch((err) => { console.error(err); process.exit(1) })
} else {
  run().catch((err) => { console.error(err); process.exit(1) })
}
