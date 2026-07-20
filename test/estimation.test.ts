// test/estimation.test.ts
import { describe, it, expect } from 'vitest';
import { estimationOperations, estimationFields } from '../nodes/TeamRetro/descriptions/Estimation';

const opValues = (estimationOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (estimationOperations.options as any[]).find((o) => o.value === op)?.routing?.request;
const opOf = (op: string) =>
  (estimationOperations.options as any[]).find((o) => o.value === op)?.routing?.operations;
const outputOf = (op: string) =>
  (estimationOperations.options as any[]).find((o) => o.value === op)?.routing?.output;

describe('Estimation resource', () => {
  it('exposes 8 operations in alphabetical display-name order', () => {
    expect(opValues).toEqual([
      'addItems',
      'create',
      'delete',
      'get',
      'getAll',
      'getReport',
      'submitEstimate',
      'update',
    ]);
  });

  it('default operation is getAll', () => {
    expect(estimationOperations.default).toBe('getAll');
  });

  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/estimations' });
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '/v1/estimations' });
    expect(routeOf('get')).toMatchObject({
      method: 'GET',
      url: '=/v1/estimations/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('update')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/estimations/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('delete')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/estimations/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('getReport')).toMatchObject({
      method: 'GET',
      url: '=/v1/estimations/{{$parameter.meetingSlug}}/report.md',
    });
    expect(routeOf('addItems')).toMatchObject({
      method: 'POST',
      url: '=/v1/estimations/{{$parameter.meetingSlug}}/items',
    });
    expect(routeOf('submitEstimate')).toMatchObject({
      method: 'POST',
      url: '=/v1/estimations/{{$parameter.meetingSlug}}/votes/{{$parameter.estimationItemSlug}}',
    });
  });

  it('delete uses deletedTrue postReceive', () => {
    expect(outputOf('delete')?.postReceive?.[0]?.type).toBe('set');
  });

  it('getAll uses offsetPagination + rootPropertyData', () => {
    expect(opOf('getAll')?.pagination?.type).toBe('offset');
    expect(outputOf('getAll')?.postReceive?.[0]?.type).toBe('rootProperty');
  });

  it('getReport uses markdownResponse (json:false, set postReceive)', () => {
    expect(routeOf('getReport')?.json).toBe(false);
    expect(outputOf('getReport')?.postReceive?.[0]?.type).toBe('set');
  });

  it('meetingSlug field shown for all ops except getAll and create', () => {
    const meetingSlug = estimationFields.find((f) => f.name === 'meetingSlug');
    expect(meetingSlug).toBeDefined();
    expect(meetingSlug?.required).toBe(true);
    const shownOps = (meetingSlug?.displayOptions?.show as any)?.operation ?? [];
    expect(shownOps).toContain('get');
    expect(shownOps).toContain('update');
    expect(shownOps).toContain('delete');
    expect(shownOps).toContain('getReport');
    expect(shownOps).toContain('addItems');
    expect(shownOps).toContain('submitEstimate');
    expect(shownOps).not.toContain('getAll');
    expect(shownOps).not.toContain('create');
  });

  it('estimationItemSlug field shown only for submitEstimate', () => {
    const itemSlug = estimationFields.find((f) => f.name === 'estimationItemSlug');
    expect(itemSlug).toBeDefined();
    expect(itemSlug?.required).toBe(true);
    const shownOps = (itemSlug?.displayOptions?.show as any)?.operation ?? [];
    expect(shownOps).toEqual(['submitEstimate']);
  });

  it('create required field is teamId', () => {
    const teamId = estimationFields.find(
      (f) => f.name === 'teamId' && (f.displayOptions?.show as any)?.operation?.includes('create'),
    );
    expect(teamId?.required).toBe(true);
    expect((teamId as any)?.routing?.send).toMatchObject({ type: 'body', property: 'teamId' });
  });

  it('addItems has a fixedCollection with items array routing', () => {
    const addItemsField = estimationFields.find(
      (f) =>
        f.type === 'fixedCollection' &&
        (f.displayOptions?.show as any)?.operation?.includes('addItems'),
    );
    expect(addItemsField).toBeDefined();
    expect((addItemsField as any)?.routing?.send?.property).toBe('items');
  });

  it('submitEstimate has an estimate value field routed to body', () => {
    const estimateField = estimationFields.find(
      (f) =>
        f.name === 'estimateValue' &&
        (f.displayOptions?.show as any)?.operation?.includes('submitEstimate'),
    );
    expect(estimateField).toBeDefined();
    expect(estimateField?.required).toBe(true);
    expect((estimateField as any)?.routing?.send).toMatchObject({ type: 'body', property: 'value' });
  });

  it('getAll teamIds/teamTags filters send a raw comma query string (no array split)', () => {
    const filters = estimationFields.find(
      (f) =>
        f.name === 'filters' && (f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    for (const prop of ['teamIds', 'teamTags']) {
      const opt = (filters as any)?.options?.find((o: any) => o.name === prop);
      expect(opt?.routing?.send).toEqual({ type: 'query', property: prop });
    }
  });
});
