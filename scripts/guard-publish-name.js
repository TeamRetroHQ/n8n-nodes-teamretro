#!/usr/bin/env node
/**
 * prepublishOnly guard.
 *
 * The manifest may carry a SCOPED dev name, which is correct only for the internal
 * GitHub Packages dev-release flow. The public npm package carries the UNSCOPED name
 * `n8n-nodes-teamretro`; the release sync rewrites the manifest before it ships.
 *
 * This guard makes a stray `npm publish` / `pnpm publish` from a developer's checkout fail loudly
 * instead of silently shipping the scoped dev name to the wrong registry. Publishing is allowed when:
 *   - the manifest name is the unscoped public name (`n8n-nodes-teamretro`), OR
 *   - ALLOW_SCOPED_PUBLISH=1 is set (the deliberate GitHub Packages dev-release path).
 */
const PUBLIC_NAME = 'n8n-nodes-teamretro';
const { name } = require('../package.json');

if (name === PUBLIC_NAME) {
  process.exit(0);
}

if (process.env.ALLOW_SCOPED_PUBLISH === '1') {
  console.error(
    `guard-publish-name: publishing scoped name "${name}" (ALLOW_SCOPED_PUBLISH=1 — GitHub Packages dev release).`,
  );
  process.exit(0);
}

console.error(
  [
    `guard-publish-name: refusing to publish.`,
    `  package.json name is "${name}", but the public package must be "${PUBLIC_NAME}".`,
    ``,
    `  - Public npm release: rename the manifest to "${PUBLIC_NAME}" first`,
    `    (the release sync workflow does this automatically).`,
    `  - GitHub Packages dev release (scoped): set ALLOW_SCOPED_PUBLISH=1.`,
  ].join('\n'),
);
process.exit(1);
