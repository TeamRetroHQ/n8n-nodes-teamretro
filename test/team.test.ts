// test/team.test.ts
import { describe, it, expect } from 'vitest';
import { teamOperations, teamFields } from '../nodes/TeamRetro/descriptions/Team';

const opValues = (teamOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (teamOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Team resource', () => {
  it('exposes the 5 team operations', () => {
    expect(opValues).toEqual(['create', 'delete', 'get', 'getAll', 'update']);
  });
  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/teams' });
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '/v1/teams' });
    expect(routeOf('get').method).toBe('GET');
    expect(routeOf('get').url).toBe('=/v1/teams/{{$parameter.teamId}}');
    expect(routeOf('update').method).toBe('PATCH');
    expect(routeOf('update').url).toBe('=/v1/teams/{{$parameter.teamId}}');
    expect(routeOf('delete').method).toBe('DELETE');
    expect(routeOf('delete').url).toBe('=/v1/teams/{{$parameter.teamId}}');
  });
  it('Create requires a name field routed to the body', () => {
    const name = teamFields.find(
      (f) => f.name === 'name' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(name?.required).toBe(true);
    expect((name as any)?.routing?.send).toMatchObject({ type: 'body', property: 'name' });
  });
});
