import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { PlaylistDraftProvider } from "@/features/playlist-draft"
import { PlaylistsProvider } from "@/features/playlists"
import { LocaleProvider } from "@/contexts/locale-context"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthStateProvider } from "@/components/providers/auth-state-provider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Capo",
  description:
    "A modern song library app for musicians featuring chords and lyrics, built with Next.js and ChordPro format.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: "/favicon.ico"
      }
    ],
    apple: "/apple-touch-icon.png",
    other: {
      rel: "mask-icon",
      url: "/safari-pinned-tab.svg",
      color: "#000000"
    }
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get("NEXT_LOCALE")
  const initialLocale: Locale =
    localeCookie && isValidLocale(localeCookie.value) ? localeCookie.value : defaultLocale

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthStateProvider>
              <LocaleProvider initialLocale={initialLocale}>
                <PlaylistsProvider>
                  <PlaylistDraftProvider>{children}</PlaylistDraftProvider>
                </PlaylistsProvider>
              </LocaleProvider>
            </AuthStateProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
