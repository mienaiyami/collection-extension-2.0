# Demos

Standalone Playwright captures for `dist/`. Own deps — not part of the extension bundle.

## Setup

```powershell
pnpm build          # repo root
cd demo
pnpm install
pnpm browsers
```

## Tours

| Script | Command | Output |
| --- | --- | --- |
| Short highlight | `pnpm tour:basic` | `output/.../basic/` |
| Full v2.6.0 changelog | `pnpm tour:changelog-v2.6.0` | `output/.../changelog-v2.6.0/` |

Promoted media for docs lives in `../github/` (e.g. `v2.6.0-changelog.webm`), linked from the root README and CHANGELOG.

```
demo/src/
  lib/          launch + seed
  tours/        one file per tour
```
