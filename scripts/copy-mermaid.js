#!/usr/bin/env node

/**
 * Copies the Mermaid ESM bundle used by the webview into assets/mermaid/.
 * Wipes the destination first so major upgrades and chunk-layout changes
 * do not leave stale or duplicate files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'node_modules', 'mermaid', 'dist');
const DEST = path.join(ROOT, 'assets', 'mermaid');
const ENTRY = path.join(SRC, 'mermaid.esm.min.mjs');
const CHUNKS_MIN = path.join(SRC, 'chunks', 'mermaid.esm.min');

/** Recursively copy a directory tree. */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

if (!fs.existsSync(ENTRY)) {
  console.error('Expected Mermaid bundle at:', ENTRY);
  console.error('Run npm install and ensure the mermaid dependency is installed.');
  process.exit(1);
}
if (!fs.existsSync(CHUNKS_MIN)) {
  console.error('Expected Mermaid chunks at:', CHUNKS_MIN);
  process.exit(1);
}

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

fs.copyFileSync(ENTRY, path.join(DEST, 'mermaid.esm.min.mjs'));
copyDir(CHUNKS_MIN, path.join(DEST, 'chunks', 'mermaid.esm.min'));

console.log('✅ Mermaid assets copied to assets/mermaid/');
