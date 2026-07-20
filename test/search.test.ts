// test/search.test.ts
import { describe, it, expect } from 'vitest';
import { searchOperations, searchFields } from '../nodes/TeamRetro/descriptions/Search';

const opValues = (searchOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (searchOperations.options as any[]).find((o) => o.value === op)?.routing?.request;
const opOf = (op: string) =>
  (searchOperations.options as any[]).find((o) => o.value === op);

describe('Search resource', () => {
  it('exposes the 1 search operation', () => {
    expect(opValues).toEqual(['search']);
  });

  it('has default operation set to search', () => {
    expect(searchOperations.default).toBe('search');
  });

  it('routes search to POST /v1/search', () => {
    expect(routeOf('search')).toMatchObject({ method: 'POST', url: '/v1/search' });
  });

  it('search action is sentence case', () => {
    const op = opOf('search');
    expect(op?.action).toBe('Search across teams');
  });

  it('uses generic hasMore pagination', () => {
    const op = opOf('search');
    const pagination = op?.routing?.operations?.pagination;
    expect(pagination?.type).toBe('generic');
    expect(pagination?.properties?.continue).toBeDefined();
  });

  it('postReceive extracts data then results', () => {
    const op = opOf('search');
    const postReceive = op?.routing?.output?.postReceive as any[];
    expect(Array.isArray(postReceive)).toBe(true);
    // must extract nested data.results in order: data first, then results
    expect(postReceive).toHaveLength(2);
    expect(postReceive[0]).toMatchObject({ type: 'rootProperty', properties: { property: 'data' } });
    expect(postReceive[1]).toMatchObject({ type: 'rootProperty', properties: { property: 'results' } });
  });

  it('queryText field is required and routed to body.queryText', () => {
    const field = searchFields.find((f) => f.name === 'queryText');
    expect(field).toBeDefined();
    expect(field?.required).toBe(true);
    expect((field as any)?.routing?.send).toMatchObject({ type: 'body', property: 'queryText' });
  });

  it('queryText field description mentions 403 and search.enabled', () => {
    const field = searchFields.find((f) => f.name === 'queryText');
    expect(field?.description).toContain('403');
    expect(field?.description).toContain('search.enabled');
  });

  it('has returnAll field gated on search operation', () => {
    const field = searchFields.find((f) => f.name === 'returnAll');
    expect(field).toBeDefined();
    expect((field?.displayOptions?.show as any)?.resource).toContain('search');
    expect((field?.displayOptions?.show as any)?.operation).toContain('search');
  });

  it('has additionalFields collection with optional filter fields', () => {
    const col = searchFields.find((f) => f.name === 'additionalFields');
    expect(col).toBeDefined();
    const optionNames = (col?.options as any[]).map((o) => o.name);
    expect(optionNames).toContain('searchType');
    expect(optionNames).toContain('teamIds');
    expect(optionNames).toContain('excludeTeamIds');
    expect(optionNames).toContain('teamTags');
    expect(optionNames).toContain('userId');
    expect(optionNames).toContain('targetTypes');
    expect(optionNames).toContain('sentiment');
    expect(optionNames).toContain('periodStart');
    expect(optionNames).toContain('periodEnd');
  });

  it('searchType options are hybrid/text/vector', () => {
    const col = searchFields.find((f) => f.name === 'additionalFields');
    const searchType = (col?.options as any[]).find((o) => o.name === 'searchType');
    const vals = searchType?.options?.map((o: any) => o.value);
    expect(vals).toContain('hybrid');
    expect(vals).toContain('text');
    expect(vals).toContain('vector');
  });

  it('sentiment options are positive/negative/neutral', () => {
    const col = searchFields.find((f) => f.name === 'additionalFields');
    const sentiment = (col?.options as any[]).find((o) => o.name === 'sentiment');
    const vals = sentiment?.options?.map((o: any) => o.value);
    expect(vals).toContain('positive');
    expect(vals).toContain('negative');
    expect(vals).toContain('neutral');
  });

  it('displayOptions gate on resource=search', () => {
    expect((searchOperations.displayOptions?.show as any)?.resource).toContain('search');
  });
});
