# z1 build notes

## Versions

| item | value |
|---|---|
| VS Code source | 1.143.1 (`e6468682`) |
| source package version | 1.143.17502 |
| Node.js | 24.18.0 (`.nvmrc`) |
| Python | 3.11 |

## Dependencies (Arch Linux)

```bash
sudo pacman -S --needed git jq nodejs npm python gcc make pkg-config \
  libx11 libxkbfile libsecret krb5 fakeroot
```

Node 24.18.0 can be installed from nodejs.org or with a version manager. If
`node` is not 24.18.0, the VS Code build scripts will warn or fail.

## Build

```bash
# from the repository root
npm ci
npm run gulp vscode-linux-x64-min-packing
```

Or use the wrapper, which also renames the output:

```bash
./z1-build.sh
```

Result:

```
z1-linux-x64/
  bin/z1
  z1
  resources/app/product.json
```

Run:

```bash
./z1-linux-x64/bin/z1
```

## Branding and themes

- `product.json` defines the product as `z1` (name, app name, data folder,
  icon name, URL protocol, Open VSX gallery, z1 issue/license URLs).
- `resources/linux/code.png` / `code.svg` are the app/window icons.
- `src/vs/workbench/browser/media/code-icon.svg` is the title-bar/tab mark.
- `src/vs/workbench/browser/parts/editor/media/letterpress-*.svg` are the
  empty-editor watermarks.
- `extensions/theme-defaults/themes/z1-*.json` are the built-in themes;
  `z1 Default` is the default dark theme (`workbenchThemeService.ts`).
- `branding/` keeps the source assets and theme originals.

## Known notes

- The optional Rust tunnel CLI is not built by the commands above.
- Telemetry has no endpoint: `product.json` sets no telemetry or update URL,
  the telemetry level defaults to `none`, and the crash reporter defaults to
  disabled. There is no host block and no scrub script — the removal is by
  configuration, so a third-party extension can still send its own telemetry.
- The source tree is based on Microsoft VS Code (MIT) and VSCodium (MIT);
  see `NOTICE.md`.
