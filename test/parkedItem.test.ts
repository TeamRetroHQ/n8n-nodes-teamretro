// test/parkedItem.test.ts
import { describe, it, expect } from 'vitest';
import { parkedItemOperations, parkedItemFields } from '../nodes/TeamRetro/descriptions/ParkedItem';

const opValues = (parkedItemOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (parkedItemOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Parked Item resource', () => {
  it('exposes the 5 parked item operations in order', () => {
    expect(opValues).toEqual(['create', 'delete', 'get', 'getAll', 'update']);
  });
  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({
      method: 'GET',
      url: '=/v1/teams/{{$parameter.teamId}}/parked-items',
    });
    expect(routeOf('create')).toMatchObject({
      method: 'POST',
      url: '=/v1/teams/{{$parameter.teamId}}/parked-items',
    });
    expect(routeOf('get')).toMatchObject({
      method: 'GET',
      url: '=/v1/teams/{{$parameter.teamId}}/parked-items/{{$parameter.parkedItemSlug}}',
    });
    expect(routeOf('update')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/teams/{{$parameter.teamId}}/parked-items/{{$parameter.parkedItemSlug}}',
    });
    expect(routeOf('delete')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/teams/{{$parameter.teamId}}/parked-items/{{$parameter.parkedItemSlug}}',
    });
  });
  it('Create requires a title field routed to the body', () => {
    const title = parkedItemFields.find(
      (f) => f.name === 'title' && (f.displayOptions?.show as any)?.operation?.includes('create')
    );
    expect(title?.required).toBe(true);
    expect((title as any)?.routing?.send).toMatchObject({ type: 'body', property: 'title' });
  });
  it('Delete operation has postReceive with deletedTrue', () => {
    const deleteOp = (parkedItemOperations.options as any[]).find((o) => o.value === 'delete');
    expect(deleteOp?.routing?.output?.postReceive).toEqual([
      { type: 'set', properties: { value: '={{ { "deleted": true } }}' } },
    ]);
  });
  it('GetAll operation has rootPropertyData postReceive', () => {
    const getAllOp = (parkedItemOperations.options as any[]).find((o) => o.value === 'getAll');
    expect(getAllOp?.routing?.output?.postReceive).toEqual([
      { type: 'rootProperty', properties: { property: 'data' } },
    ]);
  });
});
