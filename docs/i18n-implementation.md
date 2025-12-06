# Internationalization (i18n) Implementation

## Overview

This application now supports internationalization with English, Spanish, and Portuguese languages. Users can change their preferred language through the Settings page.

## Structure

### Configuration Files

- **`lib/i18n/config.ts`**: Defines available locales, default locale, and locale names
- **`lib/i18n/translations.ts`**: Translation helper functions
- **`lib/i18n/locales/`**: JSON files containing translations for each language
  - `en.json` - English
  - `es.json` - Spanish
  - `pt.json` - Portuguese

### Context & Hooks

- **`contexts/locale-context.tsx`**: React context that manages the current locale and provides translations
- **`hooks/use-translation.ts`**: Convenient hook to access translations in components

### Pages

- **`app/dashboard/settings/page.tsx`**: Settings page where users can change their language preference

## Usage

### Using translations in components

```tsx
"use client"

import { useTranslation } from "@/hooks/use-translation"

export function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t.nav.home}</h1>
      <p>{t.common.loading}</p>
    </div>
  )
}
```

### Accessing current locale

```tsx
import { useTranslation } from "@/hooks/use-translation"

export function MyComponent() {
  const { t, locale } = useTranslation()

  return <div>Current language: {locale}</div>
}
```

### Changing locale

The locale is automatically managed by the `LocaleContext`. Users can change it through:

- The Settings page (`/dashboard/settings`)
- Programmatically using `setLocale()` from `useLocale()` hook

```tsx
import { useLocale } from "@/contexts/locale-context"

export function LanguageSelector() {
  const { locale, setLocale } = useLocale()

  return <button onClick={() => setLocale("es")}>Switch to Spanish</button>
}
```

## Adding New Translations

1. Add the new key-value pair to all locale JSON files:

   - `lib/i18n/locales/en.json`
   - `lib/i18n/locales/es.json`
   - `lib/i18n/locales/pt.json`

2. Use the new translation in your component:
   ```tsx
   {
     t.yourSection.yourNewKey
   }
   ```

### Translation JSON Structure

```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save"
  },
  "nav": {
    "home": "Home",
    "settings": "Settings"
  }
}
```

## Adding New Languages

1. Create a new JSON file in `lib/i18n/locales/` (e.g., `fr.json` for French)
2. Add all translations matching the structure of existing locale files
3. Update `lib/i18n/config.ts`:

   ```ts
   export const locales = ["en", "es", "pt", "fr"] as const

   export const localeNames: Record<Locale, string> = {
     en: "English",
     es: "Español",
     pt: "Português",
     fr: "Français"
   }
   ```

4. Import and add the new locale in `lib/i18n/translations.ts`:

   ```ts
   import fr from "./locales/fr.json"

   const translations: Record<Locale, typeof en> = {
     en,
     es,
     pt,
     fr
   }
   ```

## Locale Persistence

The selected locale is stored in a cookie (`NEXT_LOCALE`) that persists across sessions. The cookie:

- Expires after 1 year
- Is accessible from all paths
- Uses `SameSite=Lax` for security

## Components Updated with i18n

- ✅ Navbar (`components/navbar.tsx`)
- ✅ Songs Client (`components/songs-client.tsx`)
- ✅ Playlists Client (`components/playlists-client.tsx`)
- ✅ Settings Page (`app/dashboard/settings/page.tsx`)

## Note on Authentication

As mentioned in the Settings page, authentication is managed through Google OAuth. User name and email cannot be modified within the application - only language preferences are editable.
