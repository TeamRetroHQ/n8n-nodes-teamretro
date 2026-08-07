// test/insight.test.ts
import { describe, it, expect } from 'vitest';
import { insightOperations, insightFields } from '../nodes/TeamRetro/descriptions/Insight';

const opValues = (insightOperations.options ?? []).map((o: any) => o.value);
const opOf = (val: string) => (insightOperations.options as any[]).find((o) => o.value === val);
const routeOf = (val: string) => opOf(val)?.routing?.request;
const filtersFor = (op: string) =>
  insightFields.find(
    (f) => f.name === 'filters' && (f.displayOptions?.show as any)?.operation?.includes(op)
  );

describe('Insight resource', () => {
  it('exposes only the Get Account Insights operation', () => {
    const names = (insightOperations.options as any[]).map((o: any) => o.name);
    expect(names).toEqual(['Get Account Insights']);
    expect(opValues).toEqual(['getAccount']);
  });

  it('defaults to getAccount', () => {
    expect(insightOperations.default).toBe('getAccount');
  });

  it('routes getAccount to the correct GET URL', () => {
    expect(routeOf('getAccount')).toMatchObject({ method: 'GET', url: '/v1/insights/account' });
  });

  it('all ops apply rootPropertyData postReceive', () => {
    for (const op of opValues) {
      const routing = opOf(op)?.routing;
      expect(routing?.output?.postReceive?.[0]?.type, `op ${op}`).toBe('rootProperty');
    }
  });

  it('no op uses returnAll or pagination', () => {
    expect(insightFields.find((f) => f.name === 'returnAll')).toBeUndefined();
    for (const op of opValues) {
      expect(opOf(op)?.routing?.operations?.pagination, `op ${op}`).toBeUndefined();
    }
  });

  it('getAccount has metric as a required top-level field routed to query param', () => {
    const f = insightFields.find(
      (f) => f.name === 'metric' && (f.displayOptions?.show as any)?.operation?.includes('getAccount')
    );
    expect(f).toBeDefined();
    expect(f?.required).toBe(true);
    expect(f?.type).toBe('options');
    expect((f as any)?.routing?.send?.type).toBe('query');
    expect((f as any)?.routing?.send?.property).toBe('metric');
  });

  it('getAccount filters include dateFrom, dateTo, healthModelIds, series, teamIds, teamTags (not metric)', () => {
    const f = filtersFor('getAccount');
    expect(f).toBeDefined();
    const names = (f?.options as any[]).map((o: any) => o.name);
    expect(names).toContain('dateFrom');
    expect(names).toContain('dateTo');
    expect(names).toContain('healthModelIds');
    expect(names).not.toContain('metric');
    expect(names).toContain('series');
    expect(names).toContain('teamIds');
    expect(names).toContain('teamTags');
  });

  // The API 400s on these combinations, so the UI must not offer them.
  it('scopes the metric-specific filters to the metrics that accept them', () => {
    const opts = filtersFor('getAccount')?.options as any[];
    const showOf = (name: string) => opts.find((o) => o.name === name)?.displayOptions?.show;
    expect(showOf('healthModelIds')).toEqual({ '/metric': ['health_latest', 'health_trend'] });
    expect(showOf('series')).toEqual({ '/metric': ['actions_trend'] });
    // The metric-agnostic filters stay ungated.
    expect(showOf('dateFrom')).toBeUndefined();
    expect(showOf('teamIds')).toBeUndefined();
  });

  it('filter options route as query params', () => {
    const f = filtersFor('getAccount');
    const dateFromOpt = (f?.options as any[]).find((o: any) => o.name === 'dateFrom');
    expect(dateFromOpt?.routing?.send?.type).toBe('query');
    expect(dateFromOpt?.routing?.send?.property).toBe('dateFrom');
  });
});
