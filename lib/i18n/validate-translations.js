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
const locales = ["en", "es", "pt"]

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
  console.log("🔍 Validating translation files...\n")

  const translations = {}
  const flatTranslations = {}

  // Load all translation files
  for (const locale of locales) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    try {
      const content = fs.readFileSync(filePath, "utf8")
      translations[locale] = JSON.parse(content)
      flatTranslations[locale] = flattenObject(translations[locale])
      console.log(`✓ Loaded ${locale}.json (${Object.keys(flatTranslations[locale]).length} keys)`)
    } catch (error) {
      console.error(`✗ Error loading ${locale}.json:`, error.message)
      process.exit(1)
    }
  }

  console.log("")

  // Get all unique keys
  const allKeys = new Set()
  for (const locale of locales) {
    Object.keys(flatTranslations[locale]).forEach((key) => allKeys.add(key))
  }

  // Check for missing keys
  let hasErrors = false
  const missingKeys = {}

  for (const locale of locales) {
    missingKeys[locale] = []
    for (const key of allKeys) {
      if (!(key in flatTranslations[locale])) {
        missingKeys[locale].push(key)
        hasErrors = true
      }
    }
  }

  // Report results
  if (hasErrors) {
    console.log("❌ Validation failed!\n")
    for (const locale of locales) {
      if (missingKeys[locale].length > 0) {
        console.log(`Missing keys in ${locale}.json:`)
        missingKeys[locale].forEach((key) => {
          console.log(`  - ${key}`)
        })
        console.log("")
      }
    }
    process.exit(1)
  } else {
    console.log("✅ All translation files are valid!")
    console.log(`   Total keys: ${allKeys.size}`)
    console.log(`   Languages: ${locales.join(", ")}`)
    console.log("")
  }
}

// Run validation
validateTranslations()
