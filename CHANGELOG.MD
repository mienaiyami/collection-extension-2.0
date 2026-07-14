## v2.6.0

### Localization & docs

- added: multi-language support with i18next (English / Spanish(incomplete) / French)
- added: French translation by @swirti (#29, #30)
- added: Discord invite link in the README

### Fixes

- fixed: sync alarm scheduling after the v2.5.1 release
- fixed: stale app setting UI when reverting to defaults (#31)
- fixed: invalid `items-center` on collection item title layouts (#32)

### Collections — search, sort & multi-select

- added: search and sort on the collections list and inside a collection, with a collapsible filters panel (based on work by @shanksxz in `feat/search-and-sort`)
- added: collection list search modes — title only, or title + items (deep), with a hint when the match is from nested items only
- added: sort by default (manual), name, modified, date (plus item count on the list), with ascending/descending; drag-reorder only when search is empty and sort is default
- added: multi-select collections (checkbox, Shift+click range, Ctrl+A for visible rows) with batch open, copy, and delete (delete requires confirmation)
- added: warning dialog before opening many links at once (≥20; may lag or crash the browser)
- added: persist list/item search mode, sort, sort direction, and filters-panel open state in app settings; keep collection list search text for the session when opening a collection and going back

### Collections — edit item

- added: edit collection item title, URL, and image (URL, file upload, or clipboard paste) from the item context menu (#35); closes #22

### Collections — duplicates

- added: remove duplicate URLs within a collection (keep most recent or oldest) from selection overflow menus and collection context menu (#10)
- added: settings toggle to auto-remove older duplicate URLs when adding a link to a collection (#10)

---

Demo walkthrough (search, sort, multi-select, open-many warning, remove duplicates, edit item, language, settings):

https://github.com/mienaiyami/collection-extension-2.0/blob/main/github/v2.6.0-changelog.mp4

## v2.5.1

- fixed: sync behavior, prevent fake sync loops.
- fixed: ui for format copy data, #7.
- added: MSEdge collection importer, <https://github.com/mienaiyami/collection-extension-msedge-exporter>
- improved: replaced timeouts with alarms for better reliability.
- improved: format copy data.
- improved: focus title on new collection.

## v2.5.0

- added: Google Drive sync support for syncing collections across / backup online.
- added: enhanced backup management
- added: privacy policy and improved documentation
- improved: collection and item ordering with better timestamp tracking
- improved: sync and authentication error handling
- improved: local backup creation and restore functionality
- fixed: context menu handling for links and pages in different contexts
- fixed: collection data filtering during sync operations
- fixed: various UI components and error management

## v2.4.2

- fixed: unable to add some pages to collection (document not defined error).
- fixed: cover image not generating for some pages.

## v2.4.1

- fixed: context menu not working in production build.
- fixed: invalid export data format
- added: item limit on context menu. it will show most recently updated 10 collections.
- update: updated context menu on import and backup restore.

## v2.4.0

- fixed: extension version showing as "dev" in firefox.
- fixed: dark theme flickering on load when light mode is enabled (you need to toggle theme once to apply new changes).
- added: apply appSetting to all instances on change
- added: context menu option to add current tab to collection.
- refactor: major code cleanup and optimization.
  - moved most storage operations to background script.

## v2.3.0

### **Dropping support for Microsoft Add-ons store.**

Microsoft Add-ons store support was dropped due to their 1 week review process, while Chrome and Firefox only takes less than a day. You can still use the extension from chrome web store, it works in Edge as well.

Chrome Store (works on all chromium browsers) : <https://chromewebstore.google.com/detail/collections/kcijpmmfajideceadmcihckmodaiehpm>

Extension version in firefox is showing "dev", it is not a dev version, it is just something I missed while adding firefox support. It has been fixed for next scheduled update.

- added: new app font settings and additional settings for more customization.
- added: option to format copied data.
- added: option to manually add items to collection.
- added: changelog popup displayed on install and update.
- fixed: backup not creating unless manually started first.
- fixed: primary button hover color and font size adjustments for better clarity.
- fixed: empty items appearing when tabs are added during loading.
- improved: collection handling and optimized post collection data update fn.
- improved: UI for add-to-collection buttons and url img preview display.
- changed: change in toast notification durations.
- updated: optimized tab management, ensuring tabs are added in correct order with enhanced image retrieval for best performance.

## v2.2.0

**Collections now work in Firefox!!**

- added : Firefox support.
- improved performance, sidebar experience.
- fixed: random loops when updating collection data.

## v2.1.0

- added : select/de-select multiple items easily by holding shift and click start and ending item, also works with shift+enter/space.
- added : shortcut key to add current tab to active collection in side-panel.
- fixed : scroll back to old position after exiting collection
- fixed : importing data getting reversed.

## v2.0.18

- fixed: disable key shortcut when input on focus
- moved toast to bottom
- removed unnecessary permission

## v2.0.17

- improved items reordering.
- added side-panel options
- shortcut keys
- icon color change to fit both light and dark themes
