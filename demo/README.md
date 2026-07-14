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

Playwright writes **WebM**. Convert to a **GIF** for docs (GitHub renders it inline).

```powershell
# from repo root
$webm = Get-Item demo/output/video/changelog-v2.6.0/*.webm | Select-Object -First 1
$gif = "github/v2.6.0-changelog.gif"
$palette = "github/_palette.png"
$vf = "setpts=0.5*PTS,fps=8,scale=360:-1:flags=lanczos"

ffmpeg -y -i $webm.FullName -vf "$vf,palettegen=stats_mode=diff:max_colors=128" -update 1 $palette
ffmpeg -y -i $webm.FullName -i $palette -lavfi "$vf[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" -loop 0 $gif
Remove-Item $palette -Force
```

```md
![v2.6.0 feature walkthrough](github/v2.6.0-changelog.gif)
```

```
demo/src/
  lib/          launch + seed
  tours/        one file per tour
```
