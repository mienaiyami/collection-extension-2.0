# Guides

## Build Instructions

npm or pnpm is required to build the extension.

```bash
# install dependencies
pnpm install

# build extension  (output in /dist)
pnpm build

# build extension zipped (output to ./build.zip)
pnpm build:zip
```

To load the extension in your browser:

- Chrome: Open `chrome://extensions/`, enable developer mode, load unpacked and select `/dist`.
- Firefox: Open `about:debugging`, click on `This Firefox`, click on `Load Temporary Add-on` and select `/dist/manifest.json`.
