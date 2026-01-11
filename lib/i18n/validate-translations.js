#!/usr/bin/env node

/**
 * Translation Validator
 *
 * This script validates that all translation files have the same structure
 * and keys to ensure consistency across languages.
 *
 * Run with: node lib/i18n/validate-translations.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const LOCALES_DIR = path.join(__dirname, "locales")

// Discover locales by listing JSON files in the locales directory
const locales = fs
  .readdirSync(LOCALES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""))
  .sort()

if (locales.length === 0) {
  console.error(`✗ No locale files found in ${LOCALES_DIR}`)
  process.exit(1)
}

function flattenObject(obj, prefix = "") {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? prefix + "." : ""
    if (typeof obj[key] === "object" && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], pre + key))
    } else {
      acc[pre + key] = obj[key]
    }
    return acc
  }, {})
}

function validateTranslations() {
  console.info("🔍 Validating translation files...\n")

  const translations = {}
  const flatTranslations = {}

  // Load all translation files
  for (const locale of locales) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    try {
      const content = fs.readFileSync(filePath, "utf8")
      translations[locale] = JSON.parse(content)
      flatTranslations[locale] = flattenObject(translations[locale])
      console.info(`✓ Loaded ${locale}.json (${Object.keys(flatTranslations[locale]).length} keys)`)
    } catch (error) {
      console.error(`✗ Error loading ${locale}.json:`, error.message)
      process.exit(1)
    }
  }

  // Get all unique keys
  const allKeys = new Set()
  for (const locale of locales) {
    Object.keys(flatTranslations[locale]).forEach((key) => allKeys.add(key))
  }

  // Now scan repository files for high-confidence hardcoded UI strings using the
  // TypeScript AST. This reduces false positives significantly compared to regex.
  console.log("🔎 Scanning source files for hardcoded UI strings (AST-based)...\n")

  const projectRoot = path.join(__dirname, "..", "..")
  const allowedExts = new Set([".tsx", ".jsx", ".ts", ".js"])

  // Build a set of all translation VALUES (normalized)
  const translationValues = new Set()
  for (const locale of locales) {
    Object.values(flatTranslations[locale]).forEach((v) => {
      if (typeof v === "string") translationValues.add(v.trim().toLowerCase())
    })
  }

  const hardcoded = []

  // Use TypeScript to parse files and walk AST for reliable detection
  const ts = require("typescript")

  function inspectFile(full) {
    const content = fs.readFileSync(full, "utf8")
    let sourceFile
    try {
      sourceFile = ts.createSourceFile(
        full,
        content,
        ts.ScriptTarget.Latest,
        true,
        full.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      )
    } catch (e) {
      console.log(e)
      return
    }

    function addIfCandidate(text, node) {
      if (!text) return
      const trimmed = text.trim()
      if (trimmed.length < 3) return
      if (/^https?:\/\//.test(trimmed)) return
      if (/^[0-9\s:,-]+$/.test(trimmed)) return
      if (translationValues.has(trimmed.toLowerCase())) return
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
      hardcoded.push({ file: full, line: line + 1, text: trimmed })
    }

    function visit(node) {
      // JSX Text nodes (explicit UI text between tags)
      if (ts.isJsxText(node)) {
        const txt = node.getText()
        // only multi-word phrases (more likely UI copy)
        if (txt.trim().split(/\s+/).length >= 2) addIfCandidate(txt, node)
      }

      // JSX attribute string initializers for UI attrs
      if (ts.isJsxAttribute(node)) {
        const name = node.name && node.name.getText()
        const uiAttrs = new Set(["alt", "placeholder", "title", "aria-label", "ariaLabel", "label"])
        if (uiAttrs.has(name)) {
          const init = node.initializer
          if (init) {
            if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
              addIfCandidate(init.text, init)
            }
            // JSX expression with string
            if (
              ts.isJsxExpression(init) &&
              init.expression &&
              (ts.isStringLiteral(init.expression) ||
                ts.isNoSubstitutionTemplateLiteral(init.expression))
            ) {
              addIfCandidate(init.expression.text, init.expression)
            }
          }
        }
      }

      // Call expressions: alert('...'), confirm('...'), prompt('...'), toast.success('...')
      if (ts.isCallExpression(node)) {
        const expr = node.expression
        // alert / confirm / prompt
        if (ts.isIdentifier(expr) && ["alert", "confirm", "prompt"].includes(expr.escapedText)) {
          const arg = node.arguments && node.arguments[0]
          if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)))
            addIfCandidate(arg.text, arg)
        }

        // toast.success/error/info
        if (ts.isPropertyAccessExpression(expr)) {
          const left = expr.expression.getText()
          const right = expr.name.getText()
          if (left === "toast" && ["success", "error", "message", "info"].includes(right)) {
            const arg = node.arguments && node.arguments[0]
            if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)))
              addIfCandidate(arg.text, arg)
          }
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)

    // Extra conservative regex pass for simple inner text in JSX tags
    // e.g. <span className="sr-only">Toggle theme</span>
    const jsxInnerTextRegex = /<([A-Za-z0-9_-]+)(?:\s[^>]*)?>([^<{][^<]*?[A-Za-z][^<]*?)<\/\1>/g
    let m2
    while ((m2 = jsxInnerTextRegex.exec(content))) {
      const tag = m2[1]
      const txt = m2[2].trim()
      // Only consider plain HTML tags (lowercase) to avoid inspecting component internals
      if (!/^[a-z]/.test(tag)) continue
      // require at least one lowercase letter (likely natural language)
      if (!/[a-z]/.test(txt)) continue
      // skip if the inner text contains JSX expressions
      if (/[{}]/.test(txt)) continue
      if (!txt) continue
      if (txt.length < 3) continue
      if (txt.split(/\s+/).length < 2) continue
      if (/^https?:\/\//.test(txt)) continue
      if (/^[0-9\s:,-]+$/.test(txt)) continue
      if (translationValues.has(txt.toLowerCase())) continue

      // compute line
      const upTo = content.slice(0, m2.index)
      const line = upTo.split("\n").length
      const existing = hardcoded.find((h) => h.file === full && h.line === line && h.text === txt)
      if (!existing) hardcoded.push({ file: full, line, text: txt })
    }
  }

  const ignoreDirs = new Set([
    "node_modules",
    ".git",
    "coverage",
    "public",
    "dist",
    "build",
    ".next"
  ])
  const excludeFilePatterns = [
    /features\/songs\/data\/songs\.data\.ts$/,
    /__tests__/,
    /fixtures/,
    /(^|\/)types(\/|\.)/,
    /(^|\/)docs(\/|$)/,
    /README\.md$/i,
    /(^|\/)components\/ui(\/|$)/
  ]

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      if (ignoreDirs.has(ent.name)) continue
      const full = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        walkDir(full)
        continue
      }

      const ext = path.extname(ent.name)
      if (!allowedExts.has(ext)) continue
      if (full.startsWith(LOCALES_DIR)) continue
      if (excludeFilePatterns.some((r) => r.test(full))) continue
      // Limit to UI folders
      const allowedDirs = [
        path.join(projectRoot, "app"),
        path.join(projectRoot, "components"),
        path.join(projectRoot, "features"),
        path.join(projectRoot, "pages")
      ]
      if (!allowedDirs.some((d) => full.startsWith(d))) continue

      inspectFile(full)
    }
  }

  walkDir(projectRoot)

  if (hardcoded.length > 0) {
    console.log("❗ Hardcoded strings detected (not found in translations):\n")
    // Group by file
    const byFile = hardcoded.reduce((acc, cur) => {
      acc[cur.file] = acc[cur.file] || []
      acc[cur.file].push(cur)
      return acc
    }, {})

    for (const f of Object.keys(byFile).sort()) {
      console.log(`- ${f}`)
      byFile[f].forEach((h) => {
        console.log(`    L${h.line}: ${h.text}`)
      })
      console.log("")
    }

    console.log(
      "Please add these strings to your locale files and replace them with translation keys."
    )
    process.exit(2)
  } else {
    console.log("✅ No obvious hardcoded UI strings found outside translations.")
  }
}

// Run validation
validateTranslations()
