import type React from "react"
import { SharedNavbar } from "@/components/layout"

export default function SharedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SharedNavbar />
      {children}
    </>
  )
}
