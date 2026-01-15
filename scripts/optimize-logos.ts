#!/usr/bin/env tsx
/**
 * Script to generate optimized raster versions of logo SVGs
 * Creates WebP and PNG versions at multiple sizes for better compression
 */

import sharp from "sharp"
import { mkdir } from "fs/promises"
import { join, basename, extname } from "path"
import { existsSync } from "fs"

const INPUT_DIR = join(process.cwd(), "public", "img")
const OUTPUT_DIR = join(process.cwd(), "public", "img", "optimized")

// Logo configurations: [name, width, height]
const LOGOS = [
  { name: "capo.svg", width: 150, height: 150 }, // Login page logo (square)
  { name: "capo-text.svg", width: 80, height: 24 } // Navbar logo (horizontal)
] as const

async function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
}

async function optimizeLogo(inputPath: string, width: number, height: number, retina = true) {
  const baseName = basename(inputPath, extname(inputPath))
  console.log(`Optimizing ${baseName}...`)

  const sizes = retina ? [1, 2] : [1]

  for (const scale of sizes) {
    const scaledWidth = width * scale
    const scaledHeight = height * scale
    const suffix = scale === 1 ? "" : `@${scale}x`

    // Generate WebP version (smaller file size)
    const webpPath = join(OUTPUT_DIR, `${baseName}${suffix}.webp`)
    await sharp(inputPath)
      .resize(scaledWidth, scaledHeight, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath)
    console.log(`  Created ${basename(webpPath)} (${scaledWidth}x${scaledHeight})`)

    // Generate PNG fallback (for browsers that don't support WebP)
    const pngPath = join(OUTPUT_DIR, `${baseName}${suffix}.png`)
    await sharp(inputPath)
      .resize(scaledWidth, scaledHeight, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(pngPath)
    console.log(`  Created ${basename(pngPath)} (${scaledWidth}x${scaledHeight})`)
  }
}

async function main() {
  console.log("Generating optimized raster logo versions...\n")

  await ensureDir(OUTPUT_DIR)

  for (const logo of LOGOS) {
    const inputPath = join(INPUT_DIR, logo.name)
    if (!existsSync(inputPath)) {
      console.warn(`Warning: ${logo.name} not found, skipping...`)
      continue
    }
    await optimizeLogo(inputPath, logo.width, logo.height, true)
  }

  console.log("\n✅ Logo optimization complete!")
  console.log(`Output directory: ${OUTPUT_DIR}`)
}

main().catch((error) => {
  console.error("Error optimizing logos:", error)
  process.exit(1)
})
