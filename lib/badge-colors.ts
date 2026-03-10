/**
 * Key badges always use the app's songs accent color (blue).
 * Consistent across all keys — no rainbow, just a clean tinted style.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getKeyColorClasses(_key: string): string {
  return "text-[var(--accent-activity)] bg-[color-mix(in_oklch,var(--accent-activity)_10%,transparent)] border-[color-mix(in_oklch,var(--accent-activity)_30%,transparent)]"
}

/**
 * BPM badges use three tiers — slow / medium / fast —
 * mapped to the existing brand palette: muted, primary, rose.
 */
export function getBpmColorClasses(bpm: number): string {
  if (bpm < 90) return "text-muted-foreground bg-muted border-border"
  if (bpm <= 130) return "text-primary bg-primary/10 border-primary/30"
  return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30"
}
