import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Capo — Song library for musicians"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const DOTS = [
  "#3b82f6", // blue  — Song Library
  "#8b5cf6", // violet — ChordPro Editor
  "#10b981", // primary-like — Setlists
  "#22c55e", // green — Team Collab
  "#ec4899", // pink  — Instant Sharing
  "#f59e0b"  // amber — Chord Diagrams
]

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a0f 0%, #130827 55%, #0a0a0f 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          filter: "blur(60px)"
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-80px",
          right: "100px",
          width: "400px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.10) 0%, transparent 70%)",
          filter: "blur(50px)"
        }}
      />

      {/* Music note */}
      <div style={{ fontSize: "56px", marginBottom: "20px", color: "rgba(255,255,255,0.25)" }}>
        ♪
      </div>

      {/* App name */}
      <div
        style={{
          fontSize: "108px",
          fontWeight: "800",
          color: "white",
          letterSpacing: "-5px",
          lineHeight: "1",
          marginBottom: "20px"
        }}
      >
        Capo
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "26px",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "52px",
          textAlign: "center",
          letterSpacing: "0.01em"
        }}
      >
        Song library for musicians
      </div>

      {/* Feature color dots */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
        {DOTS.map((color, i) => (
          <div
            key={i}
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: color,
              opacity: 0.75
            }}
          />
        ))}
      </div>

      {/* Domain */}
      <div
        style={{
          position: "absolute",
          bottom: "36px",
          fontSize: "16px",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.05em"
        }}
      >
        mfuentesg.dev
      </div>
    </div>,
    { ...size }
  )
}
