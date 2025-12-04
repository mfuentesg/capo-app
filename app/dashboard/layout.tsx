import type React from "react"
import { Navbar } from "@/components/navbar"

import "../globals.css"

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="flex-1">
      <Navbar />
      <section className="p-4">{children}</section>
    </main>
  )
}
