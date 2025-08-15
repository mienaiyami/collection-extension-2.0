# Collections - Browser Extension

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kcijpmmfajideceadmcihckmodaiehpm?label=Chrome%20Web%20Store&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/collections/kcijpmmfajideceadmcihckmodaiehpm)
[![Firefox Add-ons](https://img.shields.io/amo/v/collections?label=Firefox%20Add-ons&logo=firefox&logoColor=white)](https://addons.mozilla.org/en-US/firefox/addon/collections)
[![GitHub release](https://img.shields.io/github/v/release/mienaiyami/collection-extension-2.0?label=Latest%20Release&logo=github)](https://github.com/mienaiyami/collection-extension-2.0/releases)

Organize and manage tabs effortlessly with collections, batch operations, keyboard shortcuts, and export/import features, compatible with all browsers.

This extension simplifies tab management by allowing users to group multiple open tabs into collections, accessible through a side panel. It offers features like batch opening of URLs, keyboard shortcuts for quick actions, and support for incognito mode. Additionally, users can easily export and import collections for backup or sharing purposes.

## Installation

| Store | Link | Notes |
|-------|------|-------|
| **Chrome Web Store** | [**Install**](https://chromewebstore.google.com/detail/collections/kcijpmmfajideceadmcihckmodaiehpm) | ✅ **Recommended** - Works on all Chromium browsers |
| **Firefox Add-ons** | [**Install**](https://addons.mozilla.org/en-US/firefox/addon/collections) | ✅ Firefox only |
| ~~Microsoft Edge~~ | ~~[Install](https://microsoftedge.microsoft.com/addons/detail/collections/fpolmkmcokpklimmekilomdghljpmpcf)~~ | ⚠️ **Not Maintained** - Updates take >7 days |

### Manual Installation

1. Download `build.zip` from [**Latest Release**](https://github.com/mienaiyami/collection-extension-2.0/releases/latest)
2. Extract the zip file to a folder
3. Open your browser's extension settings:
   - **Chrome/Edge**: Navigate to `chrome://extensions/` or `edge://extensions/`
   - **Firefox**: Navigate to `about:debugging` → "This Firefox"
4. Enable **"Developer mode"** (Chrome/Edge) or click **"Load Temporary Add-on"** (Firefox)
5. Click **"Load unpacked"** and select the extracted `/dist` folder

> **Note**: Manual installation will not receive automatic updates. Use official store installations for the best experience.

## Features

### Collection Management

- Create collections from all currently opened tabs
- Organize tabs into custom collections with drag-and-drop
- Batch operations - select and open multiple URLs at once
- Smart grouping with customizable names and descriptions

### User Interface

- Side panel integration - works seamlessly with browser UI
- Light/dark mode themes

### Privacy & Sync

- Local storage - all data stored locally by default
- Export/Import - backup your collections as JSON files
- Google Drive sync - backup and sync across devices

### Productivity

- Keyboard shortcuts for power users
- Quick actions - open in new tab/window/incognito
- Bulk selection with Shift+Click range selection
- URL copying - copy multiple URLs to clipboard

## Keyboard Shortcuts

### Navigation

- **Tab** - Navigate through interface elements
- **Alt + ←** - Go back to previous view
- **Escape** - Deselect all items

### Collection Actions

| Shortcut | Action |
|----------|--------|
| `T` | Open selected items in new tabs |
| `N` | Open selected items in new window |
| `Shift + N` | Open selected items in incognito window |
| `Delete` | Delete selected items |
| `Ctrl + A` | Select all items |
| `C` | Copy URLs of selected items |

### Advanced Selection

- **Shift + Click**: Range selection between two items
- **Shift + Enter/Space**: Extend selection with keyboard navigation
- **Click first item** → **Hold Shift** → **Click last item** = Select/deselect entire range

### Browser Extension Shortcuts

- **Add current tab to active collection** - Must be configured in browser extension settings

## Development

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/mienaiyami/collection-extension-2.0.git
cd collection-extension-2.0

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

For detailed development instructions, see our [Contributing Guide](docs/contribute.md).

### Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React icons
- **Build Tool**: Vite with SWC
- **Package Manager**: pnpm
- **Browser APIs**: Chrome Extension API, WebExtension Polyfill

## Documentation

- [User Guide](docs/guide.md) - Build instructions and usage tips
- [Wiki](https://github.com/mienaiyami/collection-extension-2.0/wiki) - More information about the extension
- [Contributing](docs/contribute.md) - How to contribute to the project
- [Report Issues](https://github.com/mienaiyami/collection-extension-2.0/issues/new/choose) - Bug reports and feature requests

## Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contribute.md) for details on setting up the development environment, code style conventions, and submitting pull requests.

## Screenshots

<https://github.com/mienaiyami/collection-extension-2.0/assets/84740082/1f2b496e-30eb-46e8-977b-dbd5daa671db>

![Alt text](github/image2.png)

![Alt text](github/image4.png)

![Alt text](github/image5.png)

![Alt text](github/image.png)
