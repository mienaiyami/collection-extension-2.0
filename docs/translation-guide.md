# Translation Contribution Guide

Thank you for your interest in helping translate the Collections browser extension! This guide will help you contribute translations to make the extension accessible to users worldwide.

## How Translations Work

The Collections extension uses the **react-i18next** library for internationalization. All translatable text is stored in JSON files located in the `src/i18n/locales/` directory.

## File Structure

```
src/i18n/
├── config.ts           # i18n configuration
└── locales/
    ├── en.json         # English (default)
    ├── es.json         # Spanish
    └── [language].json # Your translation
```

## Contributing a New Translation

### Step 1: Check if Your Language Exists

First, check if your language already exists in the `src/i18n/locales/` directory. Each language has a two-letter code (ISO 639-1):

- `en` - English
- `es` - Spanish  
- `fr` - French
- `de` - German
- `ja` - Japanese
- `zh-CN` - Chinese (Simplified)
- `pt` - Portuguese
- `ru` - Russian
- `ar` - Arabic
- `hi` - Hindi

### Step 2: Create Your Translation File

1. Copy the `en.json` file and rename it to your language code (e.g., `fr.json` for French)
2. Translate all the text values while keeping the keys unchanged
3. **Important**: Only translate the text values (right side), never the keys (left side)

Example:

```json
// ✅ Correct
{
  "common": {
    "cancel": "Annuler",     // Translate this
    "delete": "Supprimer"    // Translate this
  }
}

// ❌ Wrong - Don't translate keys
{
  "commun": {               // Don't translate "common"
    "annuler": "Annuler",   // Don't translate "cancel"
    "delete": "Supprimer"
  }
}
```

### Step 3: Handle Placeholders

Some translations contain placeholders like `{{count}}` or `{{error}}`. Keep these exactly as they are:

```json
{
  "messages": {
    "copiedItems": "Copied {{count}} items",      // English
    "copiedItems": "{{count}} éléments copiés"   // French - placeholder preserved
  }
}
```

### Step 4: Add Your Language to the System

If you are not comfortable with this, skip this and only update the `src/i18n/config.ts` file and mention details in the PR.

1. Open `src/i18n/config.ts`
2. Import your translation file:

   ```typescript
   import fr from './locales/fr.json';
   ```

3. Add it to the resources object:

   ```typescript
   const resources = {
     en: { translation: en },
     es: { translation: es },
     fr: { translation: fr }  // Add this line
   };
   ```

4. Open `src/features/settings/components/LanguageSetting.tsx`
5. Add your language to the languages array:

   ```typescript
   const languages: Language[] = [
     { code: 'en', name: 'English', nativeName: 'English' },
     { code: 'es', name: 'Spanish', nativeName: 'Español' },
     { code: 'fr', name: 'French', nativeName: 'Français' },  // Add this
   ];
   ```

## Translation Guidelines

### 1. Context Matters

- **App title**: Keep "Collections" as is, or use a culturally appropriate equivalent
- **Technical terms**: Some terms like "Google Drive", "URL", "JSON" should remain in English
- **UI elements**: Buttons, menus, and labels should be concise and clear

### 2. Tone and Style

- Use a friendly, helpful tone
- Be consistent with terminology throughout
- Consider your target audience (general computer users)

### 3. Text Length

- Keep translations roughly the same length as English to avoid UI layout issues
- If translation is much longer, consider abbreviations or shorter alternatives

### 4. Cultural Adaptation

- Use appropriate date/time formats for your locale
- Consider right-to-left languages (Arabic, Hebrew) - mention this in your PR

## Translation Sections Explained

### `app`

Basic app information like title and version.

### `common`

Frequently used words like "Cancel", "Save", "Delete" that appear throughout the app.

### `settings`

All text related to the settings dialog and configuration options.

### `collections`

Text related to managing collections of tabs/bookmarks.

### `tooltips`

Help text that appears when hovering over buttons and UI elements.

### `messages`

Success/error messages and notifications shown to users.

### `dialogs`

Text for confirmation dialogs and modal windows.

### `sync`

Text related to Google Drive synchronization features.

## Testing Your Translation

1. Build and load the extension by following the [development setup guide](./contribute.md#development-setup)
2. Go to Settings and select your language
3. Navigate through the app to verify all text appears correctly

## Submitting Your Translation

### Option 1: GitHub Pull Request (Recommended)

1. Fork the repository
2. Create a new branch: `git checkout -b feat/add-french-translation`
3. Add your translation files
4. Update the configuration files as described above
5. Commit your changes: `git commit -m "Add French translation"`
6. Push to your fork: `git push origin feat/add-french-translation`
7. Create a Pull Request with a clear description

### Option 2: GitHub Issue

If you're not comfortable with Git:

1. Create a new issue on GitHub
2. Attach your completed translation file
3. Mention which language you've translated
4. A maintainer will help integrate your translation

## Translation Updates

The English translation file may be updated with new features. To keep your translation current:

1. Check for new keys in the latest `en.json`
2. Add translations for any missing keys in your language file
3. Submit a PR with the updates

## Need Help?

- **Questions about specific text**: Create an issue asking for context
- **Technical issues**: Check the existing issues or create a new one
- **Translation discussion**: Use GitHub Discussions for community input

## Translation Status

For current translation progress and status, see the [Translation Status](../README.md#translation-status) section in our README.

Thank you for helping make Collections accessible to users worldwide! 🌍

---

**Questions?** Open an issue on GitHub or start a discussion. We're here to help!
