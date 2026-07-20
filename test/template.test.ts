// test/template.test.ts
import { describe, it, expect } from 'vitest';
import { templateOperations, templateFields } from '../nodes/TeamRetro/descriptions/Template';

const opValues = (templateOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (templateOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Template resource', () => {
  it('exposes 2 operations in order: getAll, get', () => {
    expect(opValues).toEqual(['getAll', 'get']);
  });

  it('defaults to getAll', () => {
    expect(templateOperations.default).toBe('getAll');
  });

  it('routes getAll to GET /v1/templates', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/templates' });
  });

  it('routes get to GET /v1/templates/{{$parameter.templateId}}', () => {
    expect(routeOf('get')).toMatchObject({ method: 'GET', url: '=/v1/templates/{{$parameter.templateId}}' });
  });

  it('getAll wires offsetPagination and rootPropertyData', () => {
    const getAllOp = (templateOperations.options as any[]).find((o) => o.value === 'getAll');
    expect(getAllOp?.routing?.operations?.pagination?.type).toBe('offset');
    expect(getAllOp?.routing?.output?.postReceive[0]?.type).toBe('rootProperty');
  });

  it('templateId field required, shown for get', () => {
    const id = templateFields.find((f) => f.name === 'templateId');
    expect(id?.required).toBe(true);
    const ops = (id?.displayOptions?.show as any)?.operation;
    expect(ops).toContain('get');
    expect(ops).not.toContain('getAll');
  });

  it('getAll has returnAll + scoped limit fields', () => {
    const ra = templateFields.find(
      (f) => f.name === 'returnAll' && (f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    expect(ra).toBeDefined();
    const lim = templateFields.find(
      (f) =>
        f.name === 'limit' &&
        (f.displayOptions?.show as any)?.operation?.includes('getAll') &&
        (f.displayOptions?.show as any)?.returnAll?.[0] === false,
    );
    expect(lim).toBeDefined();
  });
});
