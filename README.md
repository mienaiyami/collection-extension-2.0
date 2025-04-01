# Collection extension for all browsers

Organize and manage tabs effortlessly with collections, batch operations, keyboard shortcuts, and export/import features, compatible with all browsers.

This extension simplifies tab management by allowing users to group multiple open tabs into collections, accessible through a side panel. It offers features like batch opening of URLs, keyboard shortcuts for quick actions, and support for incognito mode. Additionally, users can easily export and import collections for backup or sharing purposes. Compatible with all major browsers, it ensures a streamlined browsing experience with the convenience of installation and updates through official browser stores.

| Store | Link | Notes |
|-------|------|-------|
| Chrome Web Store | [Install](https://chromewebstore.google.com/detail/collections/kcijpmmfajideceadmcihckmodaiehpm) | ✅ Recommended - Works on all Chromium browsers |
| Firefox Add-ons | [Install](https://addons.mozilla.org/en-US/firefox/addon/collections) | ✅ Firefox only |
| ~~Microsoft Edge~~ | ~~[Install](https://microsoftedge.microsoft.com/addons/detail/collections/fpolmkmcokpklimmekilomdghljpmpcf)~~ | ⚠️ Deprecated - Updates take >7 days |

### Manual Installation

1. Download `build.zip` from [Releases](https://github.com/mienaiyami/collection-extension-2.0/releases)
2. Extract the zip file
3. Open browser's extension settings
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted `/dist` folder
7. Optional: Disable "Developer mode"

> ⚠️ **Note**: Manual installation will not receive automatic updates

## [Build Instruction](/docs/guide.md#build-instructions)

## Features

- create collection from all opened tabs.
- works as side-panel (v2.0.17 onwards).
- online sync using google drive.
- select and open urls in batch.
- works in incognito.
- shortcut keys for quick actions.
- export,import, backup data.
- more.

## Todo

- better shortcuts.
- more themes.
- optimistic ui updates.
- selectable collections (similar to links inside collection).

## Shortcut keys

- use tab to navigate.
- inside collection

- | keys | action |
    |---|---|
    |`alt + arrowLeft` | go back|
    |`delete` | delete |
    | `t` | open in new tab|
    | `n` | open in new window |
    | `shift + n` | open in incognito|
    | `escape` | deselect items |
    | `ctrl + a` | select all |
    | `c` | copy urls |

- Shift click function:
  - click on first item (can be either, select or de-select), hold shift and click on another item perform a range selection.
  - if the first items is selected then it will perform a "select" operation on the range.
  - if the first items is de-selected then it will perform a "de-select" operation on the range.
  - this function also works with shift+enter/space.
- Browser shortcuts:
  - add current tab to active collection (opened in side-panel). Must be enabled from your browser's extension settings.

## Screenshots

<https://github.com/mienaiyami/collection-extension-2.0/assets/84740082/1f2b496e-30eb-46e8-977b-dbd5daa671db>

![Alt text](github/image2.png)

![Alt text](github/image4.png)

![Alt text](github/image5.png)

![Alt text](github/image.png)
