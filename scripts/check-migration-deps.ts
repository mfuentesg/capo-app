#!/usr/bin/env tsx

/**
 * Migration Dependency Checker
 *
 * Checks which features are ready to migrate based on their dependencies.
 * A feature can only be migrated if all its dependencies have been migrated.
 *
 * Usage:
 *   npx tsx scripts/check-migration-deps.ts           # Show all features
 *   npx tsx scripts/check-migration-deps.ts songs     # Check specific feature
 */

import fs from "fs"
import path from "path"

const FEATURES_DIR = path.join(process.cwd(), "features")
const MIGRATION_LOG_FILE = path.join(process.cwd(), ".migration-status.json")

/**
 * Feature dependency graph
 * Key: feature name
 * Value: array of dependencies (must be migrated first)
 */
const DEPENDENCY_GRAPH: Record<string, string[]> = {
  activity: [],
  auth: [],
  teams: [],
  songs: [],
  playlists: [],
  "song-draft": ["songs"],
  "playlist-draft": ["playlists"],
  "playlist-sharing": ["playlists"],
  "lyrics-editor": [],
  settings: []
}

/**
 * All features in migration order
 */
const MIGRATION_ORDER = [
  "activity",
  "auth",
  "teams",
  "songs",
  "playlists",
  "song-draft",
  "playlist-draft",
  "playlist-sharing",
  "lyrics-editor",
  "settings"
]

/**
 * Check if a feature uses the auto-context API pattern
 */
function isFeatureMigrated(feature: string): boolean {
  const apiIndexPath = path.join(FEATURES_DIR, feature, "api", "index.ts")

  if (!fs.existsSync(apiIndexPath)) {
    return false
  }

  const content = fs.readFileSync(apiIndexPath, "utf-8")

  // Check if it uses createApi factory
  return content.includes("createApi") && content.includes("@/lib/supabase/factory")
}

/**
 * Check if a feature still uses direct Supabase client imports
 */
function usesDirectSupabaseClient(feature: string): string[] {
  const issues: string[] = []
  const apiDir = path.join(FEATURES_DIR, feature, "api")

  if (!fs.existsSync(apiDir)) {
    return issues
  }

  const files = findTypeScriptFiles(apiDir)

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8")

    // Check for direct imports from supabase clients
    if (
      content.includes('from "@/lib/supabase/client"') ||
      content.includes('from "@/lib/supabase/server"')
    ) {
      const relativePath = path.relative(FEATURES_DIR, file)
      issues.push(relativePath)
    }
  }

  return issues
}

/**
 * Find all TypeScript files in a directory
 */
function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...findTypeScriptFiles(fullPath))
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Get migration status of all features
 */
function getMigrationStatus(): Record<string, boolean> {
  const status: Record<string, boolean> = {}

  for (const feature of MIGRATION_ORDER) {
    status[feature] = isFeatureMigrated(feature)
  }

  return status
}

/**
 * Check if dependencies are ready for a feature
 */
function getUnmetDependencies(feature: string): string[] {
  const dependencies = DEPENDENCY_GRAPH[feature] || []
  const status = getMigrationStatus()

  return dependencies.filter((dep) => !status[dep])
}

/**
 * Get features that depend on this feature
 */
function getDependents(feature: string): string[] {
  return MIGRATION_ORDER.filter((f) => DEPENDENCY_GRAPH[f]?.includes(feature))
}

/**
 * Display status for all features
 */
function displayAllStatus() {
  const status = getMigrationStatus()

  console.log("\n📊 Auto-Context API Migration Status\n")
  console.log("Legend: ✅ Migrated | ⏳ Pending | 🔒 Blocked\n")

  let migratedCount = 0
  let pendingCount = 0

  for (const feature of MIGRATION_ORDER) {
    const isMigrated = status[feature]
    const dependencies = getUnmetDependencies(feature)

    if (isMigrated) {
      migratedCount++
      console.log(`✅ ${feature}`)
    } else if (dependencies.length > 0) {
      pendingCount++
      const blockedBy = dependencies.join(", ")
      console.log(`🔒 ${feature} (blocked by: ${blockedBy})`)
    } else {
      pendingCount++
      console.log(`⏳ ${feature}`)
    }
  }

  console.log("\n" + "─".repeat(40))
  console.log(`Migrated: ${migratedCount}/${MIGRATION_ORDER.length}`)
  console.log(`Pending: ${pendingCount}/${MIGRATION_ORDER.length}`)

  // Show what's ready to migrate
  const readyToMigrate = MIGRATION_ORDER.filter(
    (f) => !status[f] && getUnmetDependencies(f).length === 0
  )

  if (readyToMigrate.length > 0) {
    console.log("\n🚀 Ready to migrate:")
    console.log("  " + readyToMigrate.join(", "))
  }
}

/**
 * Display status for a specific feature
 */
function displayFeatureStatus(feature: string) {
  const normalizedFeature = feature.toLowerCase()

  if (!MIGRATION_ORDER.includes(normalizedFeature)) {
    console.log(`\n❌ Unknown feature: ${feature}`)
    console.log(`\nAvailable features:`)
    console.log("  " + MIGRATION_ORDER.join(", "))
    return
  }

  const isMigrated = isFeatureMigrated(normalizedFeature)
  const unmetDeps = getUnmetDependencies(normalizedFeature)
  const directImports = usesDirectSupabaseClient(normalizedFeature)
  const dependents = getDependents(normalizedFeature)

  console.log(`\n📋 Feature: ${normalizedFeature}\n`)

  // Status
  if (isMigrated) {
    console.log("Status: ✅ Migrated")
  } else if (unmetDeps.length > 0) {
    console.log(`Status: 🔒 Blocked`)
    console.log(`Blocked by: ${unmetDeps.join(", ")}`)
  } else {
    console.log("Status: ⏳ Ready to migrate")
  }

  // Dependencies
  const deps = DEPENDENCY_GRAPH[normalizedFeature] || []
  if (deps.length > 0) {
    console.log(`\nDependencies: ${deps.join(", ")}`)
  }

  // Dependents (features that depend on this)
  if (dependents.length > 0) {
    console.log(`Required by: ${dependents.join(", ")}`)
  }

  // Direct import check
  if (directImports.length > 0 && !isMigrated) {
    console.log(`\n⚠️  Pre-flight check: Found direct Supabase client imports:`)
    directImports.forEach((f) => console.log(`  - ${f}`))
    console.log("\n  These should be migrated to accept supabase as first parameter")
  }

  // Pre-flight checklist
  if (!isMigrated && unmetDeps.length === 0) {
    console.log("\n📝 Pre-flight checklist:")
    console.log("  □ All dependencies are migrated")
    console.log("  □ No direct imports from @/lib/supabase/client")
    console.log("  □ No direct imports from @/lib/supabase/server")
    console.log("  □ API functions accept supabase as first parameter")
    console.log("  □ api/index.ts uses createApi factory")
    console.log("  □ All imports updated to use api pattern")
  }
}

/**
 * Display migration progress
 */
function displayProgress() {
  const status = getMigrationStatus()
  const progress = MIGRATION_ORDER.filter((f) => status[f]).length
  const percentage = Math.round((progress / MIGRATION_ORDER.length) * 100)

  console.log(`\n📈 Progress: ${progress}/${MIGRATION_ORDER.length} (${percentage}%)\n`)

  const barWidth = 30
  const filledWidth = Math.round((progress / MIGRATION_ORDER.length) * barWidth)
  const emptyWidth = barWidth - filledWidth

  const filled = "█".repeat(filledWidth)
  const empty = "░".repeat(emptyWidth)

  console.log(`[${filled}${empty}]`)
}

/**
 * Save migration status to file
 */
function saveStatus() {
  const status = getMigrationStatus()
  fs.writeFileSync(MIGRATION_LOG_FILE, JSON.stringify(status, null, 2))
  console.log(`\n💾 Status saved to ${MIGRATION_LOG_FILE}`)
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === "--progress" || command === "-p") {
    displayProgress()
    return
  }

  if (command === "--save" || command === "-s") {
    saveStatus()
    return
  }

  if (command === "--help" || command === "-h") {
    console.log(`
Migration Dependency Checker

Usage:
  npx tsx scripts/check-migration-deps.ts [feature] [options]

Options:
  -h, --help     Show this help message
  -p, --progress Show progress bar
  -s, --save     Save status to file

Examples:
  npx tsx scripts/check-migration-deps.ts           # Show all features
  npx tsx scripts/check-migration-deps.ts songs     # Check songs feature
  npx tsx scripts/check-migration-deps.ts -p        # Show progress
`)
    return
  }

  if (args.length > 0) {
    // Check specific feature
    displayFeatureStatus(args[0])
  } else {
    // Show all status
    displayAllStatus()
    displayProgress()
  }
}

main()
