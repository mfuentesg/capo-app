import type { Locale } from "./config"
import en from "./locales/en.json"
import es from "./locales/es.json"

const translations: Record<Locale, typeof en> = {
  en,
  es
}

export function getTranslations(locale: Locale): typeof en {
  return translations[locale] || translations.en
}

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type TranslationKey = NestedKeyOf<typeof en>

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const translations = getTranslations(locale)
  const keys = key.split(".")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations
  for (const k of keys) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    value = value?.[k]
  }

  if (typeof value !== "string") {
    console.warn(`Translation key not found: ${key}`)
    return key
  }

  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return params[paramKey]?.toString() || match
    })
  }

  return value
}
