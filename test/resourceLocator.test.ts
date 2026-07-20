// test/resourceLocator.test.ts
import { describe, it, expect } from 'vitest';
import type { INodeProperties } from 'n8n-workflow';
import { teamFields } from '../nodes/TeamRetro/descriptions/Team';
import { retrospectiveFields } from '../nodes/TeamRetro/descriptions/Retrospective';
import { actionFields } from '../nodes/TeamRetro/descriptions/Action';
import { healthCheckFields } from '../nodes/TeamRetro/descriptions/HealthCheck';
import { estimationFields } from '../nodes/TeamRetro/descriptions/Estimation';
import { agreementFields } from '../nodes/TeamRetro/descriptions/Agreement';
import {
  TeamRetro,
  searchTeams,
  searchRetrospectives,
} from '../nodes/TeamRetro/TeamRetro.node';

// The 6 high-traffic ID fields upgraded to resourceLocator (design §13).
const cases: Array<{
  resource: string;
  fields: INodeProperties[];
  fieldName: string;
  searchMethod: string;
}> = [
  { resource: 'team', fields: teamFields, fieldName: 'teamId', searchMethod: 'searchTeams' },
  { resource: 'retrospective', fields: retrospectiveFields, fieldName: 'meetingSlug', searchMethod: 'searchRetrospectives' },
  { resource: 'action', fields: actionFields, fieldName: 'actionSlug', searchMethod: 'searchActions' },
  { resource: 'healthCheck', fields: healthCheckFields, fieldName: 'meetingSlug', searchMethod: 'searchHealthChecks' },
  { resource: 'estimation', fields: estimationFields, fieldName: 'meetingSlug', searchMethod: 'searchEstimations' },
  { resource: 'agreement', fields: agreementFields, fieldName: 'agreementId', searchMethod: 'searchAgreements' },
];

const primaryIdField = (fields: INodeProperties[], name: string) =>
  fields.find((f) => f.name === name && f.type === 'resourceLocator');

describe('Resource Locator upgrade (design §13)', () => {
  it.each(cases)('$resource.$fieldName is a resourceLocator with two modes (list + id)', ({ fields, fieldName, searchMethod }) => {
    const field = primaryIdField(fields, fieldName);
    expect(field).toBeDefined();
    expect(field?.type).toBe('resourceLocator');
    expect(field?.required).toBe(true);
    expect(field?.default).toEqual({ mode: 'list', value: '' });

    const modes = (field as any).modes as any[];
    expect(modes).toHaveLength(2);
    expect(modes.map((m) => m.name)).toEqual(['list', 'id']);

    const list = modes.find((m) => m.name === 'list');
    expect(list.type).toBe('list');
    expect(list.typeOptions.searchListMethod).toBe(searchMethod);
    expect(list.typeOptions.searchable).toBe(true);

    const byId = modes.find((m) => m.name === 'id');
    expect(byId.type).toBe('string');
    expect(byId.extractValue?.type).toBe('regex');
    expect(typeof byId.extractValue?.regex).toBe('string');
  });

  const fakeCtx = (data: unknown[], capture?: (opts: any) => void) => ({
    getCredentials: async () => ({ region: 'https://api.teamretro.com' }),
    helpers: {
      httpRequestWithAuthentication: async function (this: unknown, _cred: string, opts: any) {
        capture?.(opts);
        return { data };
      },
    },
  });

  it('searchTeams maps id -> value, name -> name, and includes url; no /v1 in credential', async () => {
    let sent: any;
    const ctx = fakeCtx(
      [{ id: 'aB3dE', name: 'API Team', url: 'https://app.teamretro.com/teams/aB3dE' }],
      (o) => (sent = o),
    );
    const res = await searchTeams.call(ctx as any);
    expect(sent).toMatchObject({ method: 'GET', baseURL: 'https://api.teamretro.com', url: '/v1/teams' });
    expect(res.results).toEqual([
      { name: 'API Team', value: 'aB3dE', url: 'https://app.teamretro.com/teams/aB3dE' },
    ]);
  });

  it('retrospective uses title as display and falls back to id when title is null', async () => {
    const ctx = fakeCtx([
      { id: 'r1', title: 'Sprint 24 Retro' },
      { id: 'r2', title: null },
    ]);
    const res = await searchRetrospectives.call(ctx as any);
    expect(res.results).toEqual([
      { name: 'Sprint 24 Retro', value: 'r1' },
      { name: 'r2', value: 'r2' },
    ]);
  });

  it('client-side filter matches display name case-insensitively', async () => {
    const ctx = fakeCtx([
      { id: 't1', name: 'API Team' },
      { id: 't2', name: 'Design Team' },
    ]);
    const res = await searchTeams.call(ctx as any, 'api');
    expect(res.results).toEqual([{ name: 'API Team', value: 't1' }]);
  });

  it('registers all 6 listSearch methods on the node', () => {
    const listSearch = new TeamRetro().methods?.listSearch ?? {};
    expect(Object.keys(listSearch).sort()).toEqual(
      [
        'searchActions',
        'searchAgreements',
        'searchEstimations',
        'searchHealthChecks',
        'searchRetrospectives',
        'searchTeams',
      ].sort(),
    );
    for (const fn of Object.values(listSearch)) {
      expect(typeof fn).toBe('function');
    }
  });

  it('extractValue regex correctly extracts 22-char IDs from bare id and URLs', () => {
    const teamIdField = primaryIdField(teamFields, 'teamId') as any;
    const byIdMode = teamIdField.modes.find((m: any) => m.name === 'id');
    const regex = new RegExp(byIdMode.extractValue.regex);

    const sampleId = 'aB3dE12345678901234AB1'; // exactly 22 chars
    expect(regex.exec(sampleId)?.[1]).toBe(sampleId);

    const urlWithId = 'https://app.teamretro.com/teams/aB3dE12345678901234AB1';
    expect(regex.exec(urlWithId)?.[1]).toBe(sampleId);

    const urlWithQuery = 'https://app.teamretro.com/teams/aB3dE12345678901234AB1?tab=x';
    expect(regex.exec(urlWithQuery)?.[1]).toBe(sampleId);
  });
});
