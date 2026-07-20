// test/action.test.ts
import { describe, it, expect } from 'vitest';
import { actionOperations, actionFields } from '../nodes/TeamRetro/descriptions/Action';

const opValues = (actionOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (actionOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Action resource', () => {
  it('exposes the 6 action operations in alphabetical-by-display-name order', () => {
    expect(opValues).toEqual(['create', 'delete', 'get', 'getAll', 'getAllMe', 'update']);
  });

  it('defaults to getAll', () => {
    expect(actionOperations.default).toBe('getAll');
  });

  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/actions' });
    expect(routeOf('getAllMe')).toMatchObject({ method: 'GET', url: '/v1/actions/me' });
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '/v1/actions' });
    expect(routeOf('get')).toMatchObject({ method: 'GET', url: '=/v1/actions/{{$parameter.actionSlug}}' });
    expect(routeOf('update')).toMatchObject({ method: 'PATCH', url: '=/v1/actions/{{$parameter.actionSlug}}' });
    expect(routeOf('delete')).toMatchObject({ method: 'DELETE', url: '=/v1/actions/{{$parameter.actionSlug}}' });
  });

  it('delete wires deletedTrue postReceive', () => {
    const deleteOp = (actionOperations.options as any[]).find((o) => o.value === 'delete');
    expect(deleteOp?.routing?.output?.postReceive).toBeDefined();
    expect(deleteOp?.routing?.output?.postReceive[0]?.type).toBe('set');
  });

  it('getAll wires offsetPagination and rootPropertyData', () => {
    const getAllOp = (actionOperations.options as any[]).find((o) => o.value === 'getAll');
    expect(getAllOp?.routing?.operations?.pagination?.type).toBe('offset');
    expect(getAllOp?.routing?.output?.postReceive[0]?.type).toBe('rootProperty');
  });

  it('getAllMe wires offsetPagination and rootPropertyData', () => {
    const getAllMeOp = (actionOperations.options as any[]).find((o) => o.value === 'getAllMe');
    expect(getAllMeOp?.routing?.operations?.pagination?.type).toBe('offset');
    expect(getAllMeOp?.routing?.output?.postReceive[0]?.type).toBe('rootProperty');
  });

  it('actionSlug field required, shown for get/update/delete', () => {
    const slug = actionFields.find((f) => f.name === 'actionSlug');
    expect(slug?.required).toBe(true);
    const ops = (slug?.displayOptions?.show as any)?.operation;
    expect(ops).toContain('get');
    expect(ops).toContain('update');
    expect(ops).toContain('delete');
  });

  it('Create requires a title field routed to the body', () => {
    const title = actionFields.find(
      (f) => f.name === 'title' && (f.displayOptions?.show as any)?.operation?.includes('create'),
    );
    expect(title?.required).toBe(true);
    expect((title as any)?.routing?.send).toMatchObject({ type: 'body', property: 'title' });
  });

  it('Create requires a teamId field routed to body as team.id', () => {
    const teamId = actionFields.find(
      (f) => f.name === 'teamId' && (f.displayOptions?.show as any)?.operation?.includes('create'),
    );
    expect(teamId?.required).toBe(true);
    expect((teamId as any)?.routing?.send).toMatchObject({ type: 'body', property: 'team.id' });
  });

  it('filters collection has actionStatus with exact OpenAPI enum values (accepted/all/proposed/rejected)', () => {
    // Note: ActionPost/ActionPatch have no status body field — status filter is a query param only.
    // The filter enum comes from the actionStatus parameter: accepted, proposed, rejected, all.
    const getAllFilters = actionFields.find(
      (f) => f.name === 'filters' && (f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    const statusField = (getAllFilters as any)?.options?.find((o: any) => o.name === 'actionStatus');
    const statusValues = statusField?.options?.map((o: any) => o.value).sort();
    expect(statusValues).toEqual(['accepted', 'all', 'proposed', 'rejected']);
  });

  it('getAll has returnAll + scoped limit fields', () => {
    const ra = actionFields.find(
      (f) => f.name === 'returnAll' && (f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    expect(ra).toBeDefined();
    const lim = actionFields.find(
      (f) =>
        f.name === 'limit' &&
        (f.displayOptions?.show as any)?.operation?.includes('getAll') &&
        !(f.displayOptions?.show as any)?.operation?.includes('getAllMe'),
    );
    expect(lim).toBeDefined();
  });

  it('getAllMe has its own returnAll + scoped limit fields', () => {
    const ra = actionFields.find(
      (f) => f.name === 'returnAll' && (f.displayOptions?.show as any)?.operation?.includes('getAllMe'),
    );
    expect(ra).toBeDefined();
    const lim = actionFields.find(
      (f) =>
        f.name === 'limit' &&
        (f.displayOptions?.show as any)?.operation?.includes('getAllMe') &&
        !(f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    expect(lim).toBeDefined();
  });
});
