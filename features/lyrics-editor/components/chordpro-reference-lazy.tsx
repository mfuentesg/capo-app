import dynamic from "next/dynamic"

export const LazyChordProReference = dynamic(
  () => import("./chordpro-reference").then((m) => m.ChordProReference),
  { ssr: false }
)
