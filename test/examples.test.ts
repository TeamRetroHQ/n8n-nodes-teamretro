import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import type { INodeProperties, INodePropertyCollection } from 'n8n-workflow';
import { TeamRetro } from '../nodes/TeamRetro/TeamRetro.node';
import { webhookEventValues } from '../nodes/TeamRetro/shared/webhookEvents';

// The example workflows in examples/ are customer-facing: they get imported into a real n8n
// and must keep working. Renaming a resource, operation, or parameter here would silently
// rot them, so pin every reference back to the live node description.

// import.meta.url, not __dirname — vitest loads this file as ESM, where __dirname is undefined.
const EXAMPLES_DIR = fileURLToPath(new URL('../examples', import.meta.url));
const props = new TeamRetro().description.properties;

// Properties a given resource+operation shows. A property with no displayOptions.show
// constraint on resource/operation applies to every one of them (e.g. `resource` itself).
function visibleParams(resource: string, operation: string): Map<string, INodeProperties> {
  const visible = new Map<string, INodeProperties>();
  for (const p of props) {
    const show = p.displayOptions?.show as Record<string, unknown[]> | undefined;
    if (show?.resource && !show.resource.includes(resource)) continue;
    if (show?.operation && !show.operation.includes(operation)) continue;
    visible.set(p.name, p);
  }
  return visible;
}

const byName = (options: INodeProperties[]) => new Map(options.map((o) => [o.name, o]));

// Descends into collections and fixedCollections, so a renamed nested key
// (filters.actionOverdue, additionalFields.useLastTemplate) fails the guard too.
function assertParams(
  params: Record<string, any>,
  allowed: Map<string, INodeProperties>,
  where: string,
) {
  for (const [key, value] of Object.entries(params)) {
    const prop = allowed.get(key);
    expect(prop, `${where}: "${key}" is not a parameter here`).toBeDefined();
    if (!prop || typeof value !== 'object' || value === null) continue;

    if (prop.type === 'collection') {
      assertParams(value, byName(prop.options as INodeProperties[]), `${where} > ${key}`);
    } else if (prop.type === 'fixedCollection') {
      const sections = prop.options as INodePropertyCollection[];
      for (const [section, entries] of Object.entries<any>(value)) {
        const values = sections.find((s) => s.name === section)?.values;
        expect(values, `${where} > ${key}: unknown section "${section}"`).toBeDefined();
        for (const entry of Array.isArray(entries) ? entries : [entries]) {
          assertParams(entry, byName(values ?? []), `${where} > ${key}.${section}`);
        }
      }
    }
  }
}

function operationValues(resource: string): string[] {
  const op = props.find(
    (p) =>
      p.name === 'operation' &&
      (p.displayOptions?.show?.resource as string[] | undefined)?.includes(resource),
  );
  return (op?.options ?? []).map((o: any) => o.value);
}

const files = readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith('.json'));

describe('example workflows', () => {
  it('ships at least one example', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s is a valid, self-consistent workflow', (file) => {
    const wf = JSON.parse(readFileSync(join(EXAMPLES_DIR, file), 'utf8'));
    const names = wf.nodes.map((n: any) => n.name);

    expect(new Set(names).size).toBe(names.length);
    for (const [from, conn] of Object.entries<any>(wf.connections)) {
      expect(names).toContain(from);
      for (const branch of conn.main) for (const t of branch) expect(names).toContain(t.node);
    }
    // Something has to start it, or the import is inert.
    expect(wf.nodes.some((n: any) => /trigger$/i.test(n.type))).toBe(true);
  });

  it.each(files)('%s references only real TeamRetro node parameters', (file) => {
    const wf = JSON.parse(readFileSync(join(EXAMPLES_DIR, file), 'utf8'));

    for (const node of wf.nodes) {
      if (node.type === 'n8n-nodes-teamretro.teamRetro') {
        const { resource, operation, ...rest } = node.parameters;
        expect(operationValues(resource), `${file}: unknown resource "${resource}"`).toContain(
          operation,
        );
        assertParams(rest, visibleParams(resource, operation), `${file}: ${resource}.${operation}`);
      }

      if (node.type === 'n8n-nodes-teamretro.teamRetroTrigger') {
        for (const event of node.parameters.events) {
          expect(webhookEventValues, `${file}: unknown event "${event}"`).toContain(event);
        }
      }
    }
  });
});
