// test/agreement.test.ts
import { describe, it, expect } from 'vitest';
import { agreementOperations, agreementFields } from '../nodes/TeamRetro/descriptions/Agreement';

const opValues = (agreementOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (agreementOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Agreement resource', () => {
  it('exposes the 5 agreement operations in order', () => {
    expect(opValues).toEqual(['create', 'delete', 'get', 'getAll', 'update']);
  });
  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/agreements' });
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '/v1/agreements' });
    expect(routeOf('get').method).toBe('GET');
    expect(routeOf('get').url).toBe('=/v1/agreements/{{$parameter.agreementId}}');
    expect(routeOf('update').method).toBe('PATCH');
    expect(routeOf('update').url).toBe('=/v1/agreements/{{$parameter.agreementId}}');
    expect(routeOf('delete').method).toBe('DELETE');
    expect(routeOf('delete').url).toBe('=/v1/agreements/{{$parameter.agreementId}}');
  });
  it('Create requires team.id and title fields routed to the body', () => {
    const teamId = agreementFields.find(
      (f) => f.name === 'teamId' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(teamId?.required).toBe(true);
    expect((teamId as any)?.routing?.send).toMatchObject({ type: 'body', property: 'team.id' });

    const title = agreementFields.find(
      (f) => f.name === 'title' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(title?.required).toBe(true);
    expect((title as any)?.routing?.send).toMatchObject({ type: 'body', property: 'title' });
  });
});
