#!/usr/bin/env node
/**
 * Copy node codex files (`*.node.json`) into `dist`, preserving their path under the source root.
 *
 * `n8n-node build` only copies `**\/*.{png,svg}` and `**\/__schema__/**\/*.json` static assets,
 * so the verified-node codex metadata (nodes/TeamRetro/TeamRetro.node.json) would otherwise be
 * left out of the published package. n8n loads a node's codex from `<Node>.node.json` sitting
 * next to the compiled `<Node>.node.js`, so it must land in dist.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nodesDir = path.join(root, 'nodes');

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith('.node.json')) {
      const rel = path.relative(root, full);
      const dest = path.join(root, 'dist', rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
      console.log(`copied ${rel} -> ${path.relative(root, dest)}`);
    }
  }
}

if (fs.existsSync(nodesDir)) {
  walk(nodesDir);
}
