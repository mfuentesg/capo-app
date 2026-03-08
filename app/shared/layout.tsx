import type React from "react"
import { SharedNavbar } from "@/components/layout"

export default function SharedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-[120px]" />
      </div>
      <SharedNavbar />
      {children}
    </>
  )
}
