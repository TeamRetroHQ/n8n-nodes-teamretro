// test/publicTemplate.test.ts
import { describe, it, expect } from 'vitest';
import { publicTemplateOperations, publicTemplateFields } from '../nodes/TeamRetro/descriptions/PublicTemplate';

const opValues = (publicTemplateOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (publicTemplateOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('PublicTemplate resource', () => {
  it('exposes 2 operations in order: getAll, get', () => {
    expect(opValues).toEqual(['getAll', 'get']);
  });

  it('defaults to getAll', () => {
    expect(publicTemplateOperations.default).toBe('getAll');
  });

  it('routes getAll to GET /v1/public-templates', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/public-templates' });
  });

  it('routes get to GET /v1/public-templates/{{$parameter.templateGroupId}}', () => {
    expect(routeOf('get')).toMatchObject({ method: 'GET', url: '=/v1/public-templates/{{$parameter.templateGroupId}}' });
  });

  it('templateGroupId field required, shown for get', () => {
    const id = publicTemplateFields.find((f) => f.name === 'templateGroupId');
    expect(id?.required).toBe(true);
    const ops = (id?.displayOptions?.show as any)?.operation;
    expect(ops).toContain('get');
    expect(ops).not.toContain('getAll');
  });
});
