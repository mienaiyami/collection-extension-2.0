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

## Promote for README / CHANGELOG

Playwright writes **WebM**. GitHub README inline players need a **CDN-hosted H.264 MP4** (not a relative repo path).

```powershell
# from repo root — convert tour output to H.264 MP4
ffmpeg -y -i demo/output/video/changelog-v2.6.0/*.webm `
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an `
  github/v2.6.0-changelog.mp4
```

**Inline player on github.com**

1. Open `README.md` on GitHub → Edit
2. Drag `github/v2.6.0-changelog.mp4` into the editor
3. GitHub inserts a `https://github.com/user-attachments/assets/...` URL on its own line → that renders a player

Repo links like `[demo](github/v2.6.0-changelog.mp4)` only open/download the file — they do not embed a player.

```
demo/src/
  lib/          launch + seed
  tours/        one file per tour
```
