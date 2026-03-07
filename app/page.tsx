import type { Metadata } from "next"
import Link from "next/link"
import { OptimizedLogo } from "@/components/optimized-logo"
import { ThemeToggle } from "@/components/layout"
import { SignInDialog } from "@/components/sign-in-dialog"
import {
  Music,
  FileText,
  ListMusic,
  Users,
  Share2,
  ChevronRight,
  Zap,
  ArrowRight,
  Check,
  Guitar
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Capo — Song library for musicians",
  description:
    "Your personal song library for practice and performance. Organize songs with chords and lyrics, build setlists, and collaborate with your band."
}

const features = [
  {
    icon: Music,
    title: "Song Library",
    description:
      "Keep your entire catalog in one place. Filter by key, BPM, or status. Find the right song in seconds.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: FileText,
    title: "ChordPro Editor",
    description:
      "Write and edit songs in ChordPro format with a live-preview split-pane editor and syntax highlighting.",
    color: "text-violet-500",
    bg: "bg-violet-500/10"
  },
  {
    icon: ListMusic,
    title: "Smart Setlists",
    description:
      "Build playlists for rehearsals and gigs. Drag and drop to reorder. Export and share in seconds.",
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite your bandmates to a shared library. Everyone stays in sync with the same songs and setlists.",
    color: "text-green-500",
    bg: "bg-green-500/10"
  },
  {
    icon: Share2,
    title: "Instant Sharing",
    description:
      "Share any playlist via a unique link — no account needed. Perfect for session players and venue staff.",
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  },
  {
    icon: Guitar,
    title: "Chord Diagrams",
    description:
      "Tap any chord to see a fingering diagram. Color-coded by section: verse, chorus, bridge, and more.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
]

const highlights = [
  "ChordPro format support",
  "Dark & light themes",
  "Multi-language support",
  "Real-time collaboration",
  "Drag-and-drop setlists",
  "Public playlist links"
]

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <OptimizedLogo name="capo" alt="Capo" width={32} height={32} priority className="dark:invert" />
            <span className="font-bold text-lg tracking-tight">Capo</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignInDialog>
              <Button variant="outline" size="sm">Sign In</Button>
            </SignInDialog>
            <SignInDialog>
              <Button size="sm">
                Get Started
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </SignInDialog>
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        {/* Background gradient orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/15 blur-[120px]" />
          <div className="absolute -top-20 right-0 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-primary/8 blur-[80px]" />
        </div>

        {/* Badge */}
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <Zap className="h-3.5 w-3.5" />
          Built for musicians, by musicians
        </div>

        {/* Headline */}
        <h1 className="relative max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
          Your Song Library,
          <br />
          <span
            className="bg-gradient-to-r from-primary via-amber-400 to-orange-500 bg-clip-text text-transparent"
          >
            Perfectly Tuned
          </span>
        </h1>

        <p className="relative mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          Manage your complete song catalog with chords and lyrics. Build setlists,
          collaborate with your band, and share with the world — all in one place.
        </p>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <SignInDialog>
            <Button size="lg" className="h-12 px-8 text-base font-semibold">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </SignInDialog>
          <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base">
            <Link href="#features">Explore features</Link>
          </Button>
        </div>

        {/* Highlights row */}
        <div className="relative mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {highlights.map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              {item}
            </div>
          ))}
        </div>

        {/* Hero mock — stylized song card */}
        <div className="relative mt-16 w-full max-w-3xl mx-auto">
          {/* Glow behind the card */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary/20 via-violet-500/10 to-transparent blur-2xl scale-105"
          />
          <div className="rounded-2xl border border-border/60 bg-card/90 shadow-2xl backdrop-blur overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <div className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
                <Music className="h-3 w-3" />
                Yesterday — The Beatles
              </div>
            </div>

            {/* Split-pane layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/40 text-left">
              {/* Editor pane */}
              <div className="p-5 font-mono text-sm leading-7 text-muted-foreground">
                <div className="text-primary/70">{"{title: Yesterday}"}</div>
                <div className="text-primary/70">{"{artist: The Beatles}"}</div>
                <div className="text-primary/70">{"{key: F}"}</div>
                <div className="mt-3 text-violet-400 font-semibold uppercase tracking-widest text-xs">
                  {"{start_of_verse: Verse 1}"}
                </div>
                <div className="mt-1">
                  <span className="text-amber-400">[Em]</span>
                  <span className="text-amber-400">[A7]</span> Yesterday,{" "}
                  <span className="text-amber-400">[C]</span>
                  <span className="text-amber-400">[G/B]</span> all my troubles seemed so
                </div>
                <div>
                  <span className="text-amber-400">[Am]</span> far away
                </div>
                <div className="mt-1">
                  Now it <span className="text-amber-400">[Am/G]</span>looks as though they&apos;re{" "}
                  <span className="text-amber-400">[D7]</span>here to stay
                </div>
                <div>
                  Oh, <span className="text-amber-400">[F]</span>I <span className="text-amber-400">[Em]</span>believe in{" "}
                  <span className="text-amber-400">[C]</span>yesterday
                </div>
                <div className="mt-3 text-violet-400 font-semibold uppercase tracking-widest text-xs">
                  {"{end_of_verse}"}
                </div>
              </div>

              {/* Rendered preview pane */}
              <div className="p-5 text-sm leading-8">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Live Preview
                </div>
                {/* Section label */}
                <div className="border-l-2 border-blue-500 pl-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-500/80 mb-2">
                    Verse 1
                  </div>
                  <div className="font-mono">
                    <div className="text-xs text-amber-500 font-semibold leading-5">Em&nbsp;&nbsp;&nbsp;A7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C&nbsp;&nbsp;&nbsp;&nbsp;G/B</div>
                    <div>Yesterday, all my troubles seemed so</div>
                    <div className="text-xs text-amber-500 font-semibold leading-5">Am</div>
                    <div>far away</div>
                    <div className="text-xs text-amber-500 font-semibold leading-5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Am/G&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D7</div>
                    <div>Now it looks as though they&apos;re here to stay</div>
                    <div className="text-xs text-amber-500 font-semibold leading-5">&nbsp;&nbsp;&nbsp;&nbsp;F&nbsp;&nbsp;Em&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C</div>
                    <div>Oh, I believe in yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────── */}
      <section id="features" className="relative px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-4">
              Everything you need
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Features built for the stage
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              From the first rehearsal to the last encore, Capo has you covered.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  {/* Subtle hover glow */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className={`relative mb-4 inline-flex items-center justify-center rounded-lg p-2.5 ${feature.bg}`}>
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="relative mb-2 font-semibold text-base">{feature.title}</h3>
                  <p className="relative text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Spotlight: Song Library ─────────────────────────────────────── */}
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -left-20 h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-[80px]"
        />
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-500 mb-6">
                <Music className="h-3.5 w-3.5" />
                Song Library
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                Your entire catalog,
                <br />
                always at hand
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Import and organize all your songs with rich metadata — key, BPM, tags, and
                status. Powerful filters help you find the right song in seconds, even with
                hundreds in your library.
              </p>
              <ul className="mt-6 space-y-3">
                {["Filter by key, BPM, and status", "Custom tags for any genre or mood", "Archive songs without losing them", "Instant full-text search"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
                        <Check className="h-3 w-3 text-blue-500" />
                      </div>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Mock UI */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xl">
              <div className="border-b border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium">Song Library</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-muted" />
                  <div className="h-6 w-6 rounded bg-primary/20" />
                </div>
              </div>
              {/* Filter bar */}
              <div className="border-b border-border/40 px-4 py-2.5 flex gap-2">
                {["All", "C Major", "G Major", "Active"].map((f, i) => (
                  <span
                    key={f}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {f}
                  </span>
                ))}
              </div>
              {/* Song rows */}
              <div className="divide-y divide-border/40">
                {[
                  { title: "Wonderwall", artist: "Oasis", key: "F#m", bpm: 87 },
                  { title: "Blackbird", artist: "The Beatles", key: "G", bpm: 96 },
                  { title: "Hotel California", artist: "Eagles", key: "Bm", bpm: 75 },
                  { title: "House of the Rising Sun", artist: "The Animals", key: "Am", bpm: 98 }
                ].map((song) => (
                  <div key={song.title} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15">
                      <Music className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{song.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono font-semibold">
                        {song.key}
                      </span>
                      <span className="text-xs text-muted-foreground">{song.bpm} bpm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Spotlight: Teams ───────────────────────────────────────────── */}
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 -right-20 h-[500px] w-[500px] rounded-full bg-green-500/8 blur-[80px]"
        />
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Mock UI */}
            <div className="order-last lg:order-first rounded-xl border border-border/60 bg-card overflow-hidden shadow-xl">
              <div className="border-b border-border/60 bg-muted/30 px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-medium">Band Members</span>
                <button className="rounded-md bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  + Invite
                </button>
              </div>
              <div className="divide-y divide-border/40">
                {[
                  { name: "Alex Rivera", role: "Admin", initial: "AR", color: "bg-primary/20 text-primary" },
                  { name: "Jordan Kim", role: "Member", initial: "JK", color: "bg-green-500/20 text-green-500" },
                  { name: "Sam Okafor", role: "Member", initial: "SO", color: "bg-violet-500/20 text-violet-500" },
                  { name: "Maya Patel", role: "Invited", initial: "MP", color: "bg-muted text-muted-foreground" }
                ].map((member) => (
                  <div key={member.name} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${member.color}`}
                    >
                      {member.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{member.name}</div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${member.role === "Admin" ? "bg-primary/15 text-primary" : member.role === "Invited" ? "bg-muted text-muted-foreground" : "bg-green-500/15 text-green-500"}`}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
              {/* Shared setlist preview */}
              <div className="border-t border-border/40 p-4">
                <div className="text-xs text-muted-foreground mb-2 font-medium">Shared Setlists</div>
                <div className="flex gap-2">
                  {["Saturday Gig", "Rehearsal #12", "Acoustic Set"].map((pl) => (
                    <span key={pl} className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-1 text-xs">
                      {pl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-500 mb-6">
                <Users className="h-3.5 w-3.5" />
                Team Collaboration
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                Your whole band,
                <br />
                in perfect harmony
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Invite bandmates to a shared library. Everyone works from the same songs and
                setlists, so nobody shows up to rehearsal with outdated charts.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Shared song libraries across the team",
                  "Invite members by email",
                  "Switch between personal and team context",
                  "Real-time updates for everyone"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Spotlight: Sharing ─────────────────────────────────────────── */}
      <section className="relative px-4 py-20 sm:py-28 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/4 h-[400px] w-[600px] rounded-full bg-pink-500/8 blur-[80px]"
        />
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-500 mb-6">
                <Share2 className="h-3.5 w-3.5" />
                Instant Sharing
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl leading-tight">
                Share your setlist
                <br />
                in one click
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Generate a unique link for any playlist and share it with session players,
                sound engineers, or the venue. They can view songs and lyrics without
                creating an account.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Unique share code for every playlist",
                  "No account required for viewers",
                  "Full song lyrics and chords visible",
                  "Works on any device"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-500/15">
                      <Check className="h-3 w-3 text-pink-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock share card */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xl">
              <div className="bg-gradient-to-br from-pink-500/10 via-violet-500/5 to-transparent p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20">
                    <ListMusic className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <div className="font-semibold">Saturday Night Gig</div>
                    <div className="text-xs text-muted-foreground">12 songs · Shared playlist</div>
                  </div>
                </div>
                {/* Share link */}
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5">
                  <div className="min-w-0 flex-1 font-mono text-xs text-muted-foreground truncate">
                    capo.app/shared/<span className="text-primary">xK9mR4pQ</span>
                  </div>
                  <button className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    Copy
                  </button>
                </div>
              </div>
              {/* Song list */}
              <div className="divide-y divide-border/40">
                {[
                  "1. Wonderwall — Oasis",
                  "2. Mr. Brightside — The Killers",
                  "3. Somebody That I Used to Know — Gotye",
                  "4. Pumped Up Kicks — Foster the People"
                ].map((song) => (
                  <div key={song} className="px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
                    {song}
                  </div>
                ))}
                <div className="px-4 py-2.5 text-xs text-muted-foreground/60">
                  +8 more songs...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="relative px-4 py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <div className="h-[600px] w-[600px] rounded-full bg-primary/12 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <OptimizedLogo name="capo" alt="Capo" width={72} height={72} className="opacity-90 dark:invert" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Ready to play?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join musicians who use Capo to stay organized, rehearse smarter, and
            perform with confidence.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <SignInDialog>
              <Button size="lg" className="h-12 px-10 text-base font-semibold">
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignInDialog>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Sign in with Google · No credit card required
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <OptimizedLogo name="capo" alt="Capo" width={24} height={24} className="dark:invert" />
            <span className="text-sm font-semibold">Capo</span>
            <span className="text-xs text-muted-foreground">
              — Song library for musicians
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <SignInDialog>
              <button className="hover:text-foreground transition-colors">Sign In</button>
            </SignInDialog>
            <span>·</span>
            <span>© {new Date().getFullYear()} Capo</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
