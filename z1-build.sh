#!/usr/bin/env bash
# Build the z1 portable editor.
set -euo pipefail
cd "$(dirname "$0")"

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

npm ci

# Build the built-in extensions and stage resources first: the packing task
# alone only bundles a handful of extensions.
npm run gulp vscode-min-prepack
npm run gulp vscode-linux-x64-min-packing

# The VS Code gulp tasks write the portable app next to the source tree.
SRC=""
for d in VSCode-linux-x64 ../VSCode-linux-x64; do
	if [[ -d "${d}" ]]; then SRC="${d}"; break; fi
done
if [[ -z "${SRC}" ]]; then
	echo "build output (VSCode-linux-x64) not found" >&2
	exit 1
fi

rm -rf z1-linux-x64
mv "${SRC}" z1-linux-x64
printf 'built %s\n' "$PWD/z1-linux-x64/bin/z1"
