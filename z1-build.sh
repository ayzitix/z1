#!/usr/bin/env bash
# Build the z1 portable editor.
set -euo pipefail
cd "$(dirname "$0")"

npm ci
npm run gulp vscode-linux-x64-min-packing

rm -rf z1-linux-x64
mv VSCode-linux-x64 z1-linux-x64
printf 'built %s\n' "$PWD/z1-linux-x64/bin/z1"
