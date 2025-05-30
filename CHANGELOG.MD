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
