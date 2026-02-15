import type { Metadata } from "next"
import { cookies } from "next/headers"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { LocaleProvider } from "@/features/settings"
import { defaultLocale, isValidLocale } from "@/lib/i18n/config"
import type { Locale } from "@/lib/i18n/config"
import { QueryProvider } from "@/components/providers/query-provider"
import { AuthStateProvider } from "@/features/auth"
import { AppContextProvider } from "@/features/app-context"
import { getInitialAppContextData } from "@/features/app-context/server"

import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff2",
  variable: "--font-geist-sans",
  weight: "100 900"
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff2",
  variable: "--font-geist-mono",
  weight: "100 900"
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

  // Get selected team ID, user ID, and user teams from the server
  const appContextData = await getInitialAppContextData()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/img/optimized/capo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/img/optimized/capo-text.webp" as="image" type="image/webp" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider initialUser={appContextData.user}>
            <AuthStateProvider>
              <AppContextProvider
                initialSelectedTeamId={appContextData.initialSelectedTeamId}
                initialTeams={appContextData.teams}
                initialUser={appContextData.user}
              >
                <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
              </AppContextProvider>
            </AuthStateProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
