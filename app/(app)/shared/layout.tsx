import type React from "react"
import { SharedNavbar } from "@/components/layout"

export default function SharedLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.793 0.132 56 / 12%) 0%, transparent 70%)"
          }}
        />
        <div
          className="absolute bottom-0 -left-20 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.749 0.160 298 / 14%) 0%, transparent 70%)"
          }}
        />
      </div>
      <SharedNavbar />
      {children}
    </>
  )
}
