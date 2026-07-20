import { describe, it, expect } from 'vitest';
import { TeamRetro } from '../nodes/TeamRetro/TeamRetro.node';

describe('TeamRetro node base', () => {
  const d = new TeamRetro().description;
  it('sends the base URL from the credential, no /v1', () => {
    expect(d.requestDefaults?.baseURL).toBe(
      "={{ $credentials.region === 'custom' ? $credentials.customBaseUrl : $credentials.region }}",
    );
  });
  it('lists all 16 resources', () => {
    const resource = d.properties.find((p) => p.name === 'resource');
    const values = (resource?.options ?? []).map((o: any) => o.value);
    expect(values).toEqual([
      'action','agreement','comment','estimation','healthCheck','healthModel',
      'insight','parkedItem','publicTemplate','report','retrospective','search','team',
      'teamMember','template','user',
    ]);
  });
});
