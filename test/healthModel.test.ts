// test/healthModel.test.ts
import { describe, it, expect } from 'vitest';
import { healthModelOperations, healthModelFields } from '../nodes/TeamRetro/descriptions/HealthModel';

const opValues = (healthModelOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (healthModelOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('HealthModel resource', () => {
  it('exposes 2 operations in order: getAll, get', () => {
    expect(opValues).toEqual(['getAll', 'get']);
  });

  it('defaults to getAll', () => {
    expect(healthModelOperations.default).toBe('getAll');
  });

  it('routes getAll to GET /v1/health-models', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/health-models' });
  });

  it('routes get to GET /v1/health-models/{{$parameter.healthModelId}}', () => {
    expect(routeOf('get')).toMatchObject({ method: 'GET', url: '=/v1/health-models/{{$parameter.healthModelId}}' });
  });

  it('getAll wires offsetPagination and rootPropertyData', () => {
    const getAllOp = (healthModelOperations.options as any[]).find((o) => o.value === 'getAll');
    expect(getAllOp?.routing?.operations?.pagination?.type).toBe('offset');
    expect(getAllOp?.routing?.output?.postReceive[0]?.type).toBe('rootProperty');
  });

  it('healthModelId field required, shown for get', () => {
    const slug = healthModelFields.find((f) => f.name === 'healthModelId');
    expect(slug?.required).toBe(true);
    const ops = (slug?.displayOptions?.show as any)?.operation;
    expect(ops).toContain('get');
    expect(ops).not.toContain('getAll');
  });

  it('getAll has returnAll + scoped limit fields', () => {
    const ra = healthModelFields.find(
      (f) => f.name === 'returnAll' && (f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    expect(ra).toBeDefined();
    const lim = healthModelFields.find(
      (f) =>
        f.name === 'limit' &&
        (f.displayOptions?.show as any)?.operation?.includes('getAll') &&
        (f.displayOptions?.show as any)?.returnAll?.[0] === false,
    );
    expect(lim).toBeDefined();
  });
});
