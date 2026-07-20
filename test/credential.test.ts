// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import { describe, it, expect } from 'vitest';
import { TeamRetroApi } from '../credentials/TeamRetroApi.credentials';

describe('TeamRetroApi credential', () => {
  const c = new TeamRetroApi();
  it('injects the x-api-key header', () => {
    expect(c.authenticate.properties.headers).toHaveProperty('x-api-key', '={{$credentials.apiKey}}');
  });
  it('tests against /v1/teams with a host-only base URL', () => {
    expect(c.test.request.url).toBe('/v1/teams');
    const region = c.properties.find((p) => p.name === 'region');
    expect((region?.default as string)).toBe('https://api.teamretro.com');
    expect((region?.default as string)).not.toContain('/v1'); // guards the concat bug
    expect((region?.options ?? []).map((o: any) => o.value)).toContain('custom');
  });
});
