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
  it('exposes 7 operations in alphabetical order by display name', () => {
    const names = (insightOperations.options as any[]).map((o: any) => o.name);
    expect(names).toEqual([
      'Get Account Insights',
      'Get Action Insights',
      'Get Action Trends',
      'Get Activity Insights',
      'Get Health Rating Trends',
      'Get Latest Health Ratings',
      'Get Meeting Cadence',
    ]);
    expect(opValues).toEqual([
      'getAccount',
      'getActions',
      'getActionTrends',
      'getActivity',
      'getHealthTrends',
      'getHealthLatest',
      'getMeetingCadence',
    ]);
  });

  it('routes each op to the correct GET URL', () => {
    expect(routeOf('getAccount')).toMatchObject({ method: 'GET', url: '/v1/insights/account' });
    expect(routeOf('getActions')).toMatchObject({ method: 'GET', url: '/v1/insights/actions' });
    expect(routeOf('getActionTrends')).toMatchObject({ method: 'GET', url: '/v1/insights/actions/trends' });
    expect(routeOf('getActivity')).toMatchObject({ method: 'GET', url: '/v1/insights/activity' });
    expect(routeOf('getHealthLatest')).toMatchObject({ method: 'GET', url: '/v1/insights/health/latest' });
    expect(routeOf('getMeetingCadence')).toMatchObject({ method: 'GET', url: '/v1/insights/meeting-cadence' });
    expect(routeOf('getHealthTrends')).toMatchObject({ method: 'GET', url: '/v1/insights/health/trends' });
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

  it('getActivity filters include dateFrom, dateTo, teamIds, teamTags', () => {
    const f = filtersFor('getActivity');
    expect(f).toBeDefined();
    const names = (f?.options as any[]).map((o: any) => o.name);
    expect(names).toContain('dateFrom');
    expect(names).toContain('dateTo');
    expect(names).toContain('teamIds');
    expect(names).toContain('teamTags');
  });

  it('getHealthLatest filters include healthModelIds, teamIds, teamTags', () => {
    const f = filtersFor('getHealthLatest');
    expect(f).toBeDefined();
    const names = (f?.options as any[]).map((o: any) => o.name);
    expect(names).toContain('healthModelIds');
    expect(names).toContain('teamIds');
    expect(names).toContain('teamTags');
  });

  it('getActionTrends filters include series', () => {
    const f = filtersFor('getActionTrends');
    const names = (f?.options as any[]).map((o: any) => o.name);
    expect(names).toContain('series');
  });

  it('filter options route as query params', () => {
    const f = filtersFor('getActivity');
    const dateFromOpt = (f?.options as any[]).find((o: any) => o.name === 'dateFrom');
    expect(dateFromOpt?.routing?.send?.type).toBe('query');
    expect(dateFromOpt?.routing?.send?.property).toBe('dateFrom');
  });
});
