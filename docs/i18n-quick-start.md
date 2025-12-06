# Quick Start Guide - Internationalization

## 🚀 Getting Started

Your Capo app now supports **English**, **Spanish**, and **Portuguese**!

## For End Users

### Changing Your Language

1. **Open the app** and log in
2. **Click your profile avatar** in the top-right corner
3. **Select "Settings"** from the dropdown menu
4. **Choose your language** from the dropdown:
   - 🇬🇧 English
   - 🇪🇸 Español (Spanish)
   - 🇧🇷 Português (Portuguese)
5. **Done!** The app updates immediately

### Where You'll See Changes

- Navigation menu (Songs, Playlists, Settings)
- Page titles and headers
- Buttons (Save, Cancel, Delete, etc.)
- Search placeholders
- All UI text

## For Developers

### Quick Usage Example

```tsx
"use client"

import { useTranslation } from "@/hooks/use-translation"

export function MyComponent() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t.songs.title}</h1>
      <button>{t.common.save}</button>
    </div>
  )
}
```

### Most Common Translations

```tsx
// Buttons
{
  t.common.save
}
{
  t.common.cancel
}
{
  t.common.delete
}
{
  t.common.edit
}

// Navigation
{
  t.nav.songs
}
{
  t.nav.playlists
}
{
  t.nav.settings
}

// Pages
{
  t.songs.title
}
{
  t.playlists.title
}
{
  t.settings.title
}
```

### Adding a New Translation

Edit these three files with the same key:

1. `lib/i18n/locales/en.json`

```json
{
  "mySection": {
    "myKey": "Hello World"
  }
}
```

2. `lib/i18n/locales/es.json`

```json
{
  "mySection": {
    "myKey": "Hola Mundo"
  }
}
```

3. `lib/i18n/locales/pt.json`

```json
{
  "mySection": {
    "myKey": "Olá Mundo"
  }
}
```

Then use it:

```tsx
{
  t.mySection.myKey
}
```

## Testing

```bash
# Start dev server
pnpm dev

# Navigate to settings
open http://localhost:3000/dashboard/settings

# Try changing languages!
```

## Important Notes

✅ Language choice is **automatically saved**  
✅ Works across **all pages**  
✅ **Persists** after browser reload  
✅ All components are **type-safe**  
⚠️ User name/email are managed by Google (not editable)

## Need Help?

- Check `docs/i18n-implementation.md` for detailed documentation
- Check `docs/i18n-summary.md` for complete feature list
- See `components/i18n-example.tsx` for usage examples

---

**Ready to go!** 🎉 Start the dev server and visit `/dashboard/settings` to try it out!
