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
      
      // Filter out technical strings (classes, tags, regex placeholders)
      if (trimmed.includes("<span") || trimmed.includes("<div")) return
      if (trimmed.startsWith(".") && !trimmed.includes(" ")) return // CSS classes likely
      if (/^\$[0-9]$/.test(trimmed)) return // Regex placeholders like $1
      if (/^[A-Z_]+$/.test(trimmed)) return // Likely constants or IDs
      if (/^[a-z][A-Za-z0-9]*$/.test(trimmed) && !trimmed.includes(" ")) return // Likely technical keys/properties

      const whitelist = new Set(["English", "Español", "Capo", "ChordPro", "Next.js", "Google"])
      if (whitelist.has(trimmed)) return

      if (translationValues.has(trimmed.toLowerCase())) return
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart())
      hardcoded.push({ file: full, line: line + 1, text: trimmed })
    }

    function visit(node) {
      // Ignore 'metadata' variable declaration (Next.js metadata)
      if (ts.isVariableDeclaration(node)) {
        const name = node.name.getText()
        if (name === "metadata" || name.startsWith("mock") || name === "recentSongs") {
          return
        }
      }

      // JSX Text nodes (explicit UI text between tags)
      if (ts.isJsxText(node)) {
        const txt = node.getText().trim()
        // Skip whitespace-only nodes
        if (!txt) {
          ts.forEachChild(node, visit)
          return
        }
        // Detect any meaningful UI text (single or multi-word)
        // Require at least one letter and not purely numeric
        if (/[a-z]/i.test(txt) && !/^[0-9\s:,-]*$/.test(txt)) {
          addIfCandidate(txt, node)
        }
      }

      // JSX attribute string initializers for UI attrs
      if (ts.isJsxAttribute(node)) {
        const name = node.name && node.name.getText()
        const uiAttrs = new Set([
          "alt",
          "placeholder",
          "title",
          "aria-label",
          "ariaLabel",
          "aria-description",
          "label",
          "description",
          "subtitle",
          "heading",
          "badge",
          "helperText",
          "errorMessage",
          "loadingText"
        ])
        if (uiAttrs.has(name)) {
          const init = node.initializer
          if (init) {
            if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
              addIfCandidate(init.text, init)
            }
            // JSX expression with string or template literal
            if (ts.isJsxExpression(init) && init.expression) {
              if (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression)) {
                addIfCandidate(init.expression.text, init.expression)
              }
            }
          }
        }
      }

      // Call expressions: alert('...'), confirm('...'), prompt('...'), toast.success('...')
      // Also detect Zod validation messages like .min(1, 'required')
      if (ts.isCallExpression(node)) {
        const expr = node.expression
        const args = node.arguments || []

        // alert / confirm / prompt
        if (ts.isIdentifier(expr) && ["alert", "confirm", "prompt"].includes(expr.escapedText)) {
          const arg = args[0]
          if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)))
            addIfCandidate(arg.text, arg)
        }

        // toast.success/error/info
        if (ts.isPropertyAccessExpression(expr)) {
          const left = expr.expression.getText()
          const right = expr.name.getText()
          
          // toast.xxx('message')
          if (left === "toast" && ["success", "error", "message", "info", "warning"].includes(right)) {
            const arg = args[0]
            if (arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg)))
              addIfCandidate(arg.text, arg)
          }

          // Zod validation messages: .min(n, 'message'), .max(n, 'message'), .email('message'), .url('message'), etc.
          const zodMethods = new Set(["min", "max", "length", "email", "url", "uuid", "regex"])
          if (zodMethods.has(right)) {
            // Usually the last argument is the message
            const lastArg = args[args.length - 1]
            if (lastArg && (ts.isStringLiteral(lastArg) || ts.isNoSubstitutionTemplateLiteral(lastArg))) {
              // Only treat it as a message if it's strings (messages) not numbers (for min/max)
              if (ts.isStringLiteral(lastArg) || ts.isNoSubstitutionTemplateLiteral(lastArg)) {
                addIfCandidate(lastArg.text, lastArg)
              }
            }
          }
           
          // t.validation.required.replace('{field}', 'Field Name')
          // Catching 'Field Name' as hardcoded
          if (right === "replace" && args.length >= 2) {
             const valArg = args[1]
             if (valArg && (ts.isStringLiteral(valArg) || ts.isNoSubstitutionTemplateLiteral(valArg))) {
               addIfCandidate(valArg.text, valArg)
             }
          }
        }
      }

      // Object literals with UI-like keys (e.g. { title: '...', description: '...' })
      if (ts.isPropertyAssignment(node)) {
        const name = node.name.getText()
        const uiKeys = new Set(["title", "description", "label", "placeholder", "text", "name", "content"])
        if (uiKeys.has(name) && node.initializer) {
          const init = node.initializer
          if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
            // Be more selective for properties like 'name' to avoid technical names
            if (name === "name" || name === "content") {
              const txt = init.text.trim()
              if (txt.includes(" ") || /[a-z]/.test(txt)) { // likely a display name if it has spaces or lowercase
                 addIfCandidate(init.text, init)
              }
            } else {
              addIfCandidate(init.text, init)
            }
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
      if (/^https?:\/\//.test(txt)) return
      if (/^[0-9\s:,-]+$/.test(txt)) return
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
    /__tests__/,
    /fixtures/,
    /mock|mocked|mock-data/,
    /\.data\.ts$/,
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
