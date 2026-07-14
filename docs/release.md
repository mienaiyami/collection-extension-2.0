# Release guide

Maintainer notes for shipping a version with `pnpm release` (`release.ts`) and the GitHub tag workflow.

## Checklist

1. Update `CHANGELOG.MD` for the new version.
2. Bump `version` in `package.json` and commit.
3. Ensure `.env` has all required keys (see below).
4. Install tools: Node 18+, pnpm, global **`web-ext`** (`npm i -g web-ext`).
5. Build is included in release: `pnpm release` → `pnpm build:zip` then `tsx release.ts`.
6. Press Enter at the prompt to continue (any other input aborts).

What `release.ts` does, in order:

1. Annotated git tag `v{version}` + `git push --tags`
2. Firefox: `web-ext sign --channel=listed` in `dist/`
3. Chrome: upload + publish `build.zip` via Chrome Web Store API

Pushing the tag also triggers [`.github/workflows/release.yml`](../.github/workflows/release.yml), which builds and attaches `build.zip` to the GitHub Release.

## Environment variables

Create a root `.env` (never commit it):

| Variable | Used for |
| --- | --- |
| `AMO_JWT_ISSUER` | Firefox AMO API key (JWT issuer) |
| `AMO_JWT_SECRET` | Firefox AMO API key (JWT secret) |
| `CHROME_CLIENT_ID` | Google OAuth client for Web Store API |
| `CHROME_CLIENT_SECRET` | Google OAuth client secret |
| `CHROME_REFRESH_TOKEN` | Long-lived token from OAuth Playground |
| `CHROME_EXTENSION_ID` | Chrome Web Store item id |

## Firefox (AMO)

### Credentials

1. [Firefox Add-on Developer Hub — API credentials](https://addons.mozilla.org/developers/addon/api/key/)  
   Create or regenerate **JWT issuer** + **JWT secret** → `AMO_JWT_ISSUER` / `AMO_JWT_SECRET`.
2. Sign in with the account that owns the listed add-on.

### Docs & tools

- [web-ext sign](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-sign)
- [Signing and distributing your add-on](https://extensionworkshop.com/documentation/publish/signing-and-distributing-your-addon/)
- [AMO developer hub](https://addons.mozilla.org/developers/)
- This product on AMO: [Collections](https://addons.mozilla.org/en-US/firefox/addon/collections/)

### Notes

- Signing runs from `./dist` (unpacked build), not from `build.zip`.
- On Windows, `web-ext` must be on PATH (global install). `release.ts` uses `shell: true` so the `.cmd` shim resolves.
- Exit code `-4058` / ENOENT usually means `web-ext` is not on PATH for Node.

## Chrome Web Store

### Credentials (refresh token)

Follow Google’s guide end-to-end:

1. **[Use the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api)** — official setup.
2. [Enable Chrome Web Store API](https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com) on your Google Cloud project.
3. [Credentials](https://console.cloud.google.com/apis/credentials) → Create **OAuth client ID** → type **Web application**.  
   Add authorized redirect URI:  
   `https://developers.google.com/oauthplayground`
4. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)  
   - Gear → **Use your own OAuth credentials** → paste client id/secret  
   - Scope: `https://www.googleapis.com/auth/chromewebstore`  
   - Authorize → **Exchange authorization code for tokens**  
   - Copy **Refresh token** → `CHROME_REFRESH_TOKEN`
5. Extension id: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) → your item → copy id → `CHROME_EXTENSION_ID`  
   Live listing: [Collections on CWS](https://chromewebstore.google.com/detail/collections/kcijpmmfajideceadmcihckmodaiehpm)

Optional helper CLI (same keys): [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys)

### Docs

- [Chrome Web Store API reference](https://developer.chrome.com/docs/webstore/api_index)
- [Publish in the Chrome Web Store](https://developer.chrome.com/docs/webstore/publish/)

### Notes

- `invalid_grant` / Bad Request on token refresh → regenerate refresh token (and ensure client id/secret match the same OAuth client).
- Tokens can be revoked if unused for a long time, or if the OAuth client was recreated.
- Upload uses `build.zip` at the repo root.

## GitHub release

- Workflow: [`.github/workflows/release.yml`](../.github/workflows/release.yml) on tag `v*.*.*`
- Releases page: <https://github.com/mienaiyami/collection-extension-2.0/releases>
- Changelog linked from the release body: [CHANGELOG.MD](../CHANGELOG.MD)

## Demo / store assets (optional)

After a feature release, regenerate the changelog walkthrough GIF from `demo/`:

- [demo/README.md](../demo/README.md) — tours + ffmpeg GIF promote steps
- Promoted asset: `github/v2.6.0-changelog.gif` (embed in README / CHANGELOG)

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `sign addon: exited with code -4058` | `web-ext` not found; install globally and retry |
| Firefox sign auth errors | Bad/expired `AMO_JWT_*`; regenerate at AMO API key page |
| Chrome `invalid_grant` | Stale refresh token or mismatched client id/secret; redo OAuth Playground |
| Tag already exists | Version already tagged; bump `package.json` or delete/retag carefully |
| Missing env error at start | Incomplete `.env`; see table above |

## Quick links

| Topic | Link |
| --- | --- |
| Chrome Web Store API (OAuth) | <https://developer.chrome.com/docs/webstore/using-api> |
| OAuth Playground | <https://developers.google.com/oauthplayground> |
| Enable CWS API | <https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com> |
| Google Cloud credentials | <https://console.cloud.google.com/apis/credentials> |
| CWS developer dashboard | <https://chrome.google.com/webstore/devconsole> |
| Firefox AMO API keys | <https://addons.mozilla.org/developers/addon/api/key/> |
| web-ext reference | <https://extensionworkshop.com/documentation/develop/web-ext-command-reference/> |
| Extension Workshop (publish) | <https://extensionworkshop.com/documentation/publish/> |
