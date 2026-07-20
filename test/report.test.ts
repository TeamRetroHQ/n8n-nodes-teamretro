// test/report.test.ts
import { describe, it, expect } from 'vitest';
import { reportOperations, reportFields } from '../nodes/TeamRetro/descriptions/Report';

const opValues = (reportOperations.options ?? []).map((o: any) => o.value);
const opOf = (val: string) => (reportOperations.options as any[]).find((o) => o.value === val);
const routeOf = (val: string) => opOf(val)?.routing?.request;
const filtersFor = (op: string) =>
  reportFields.find(
    (f) => f.name === 'filters' && (f.displayOptions?.show as any)?.operation?.includes(op)
  );

describe('Report resource', () => {
  it('exposes 9 operations in alphabetical order by display name', () => {
    const names = (reportOperations.options as any[]).map((o: any) => o.name);
    expect(names).toEqual([
      'Get Health Check Activity Report',
      'Get Retrospective Activity Report',
      'Get Team Action Activity Report',
      'Get Team Activity Report',
      'Get Team Health (Historical) Report',
      'Get Team Health (Latest) Report',
      'Get Team Overview Report',
      'Get Team Reports (Batch)',
      'Get Users Report',
    ]);
    expect(opValues).toEqual([
      'getHealthCheckActivity',
      'getRetrospectiveActivity',
      'getTeamActionActivity',
      'getTeamActivity',
      'getTeamHealthHistorical',
      'getTeamHealthLatest',
      'getTeamOverview',
      'getTeamReports',
      'getUsers',
    ]);
  });

  it('routes each op to the correct GET URL', () => {
    expect(routeOf('getTeamOverview')).toMatchObject({ method: 'GET', url: '/v1/reports/team-overview' });
    expect(routeOf('getTeamActivity')).toMatchObject({ method: 'GET', url: '/v1/reports/team-activity' });
    expect(routeOf('getTeamActionActivity')).toMatchObject({ method: 'GET', url: '/v1/reports/team-action-activity' });
    expect(routeOf('getRetrospectiveActivity')).toMatchObject({ method: 'GET', url: '/v1/reports/retrospective-activity' });
    expect(routeOf('getHealthCheckActivity')).toMatchObject({ method: 'GET', url: '/v1/reports/health-check-activity' });
    expect(routeOf('getUsers')).toMatchObject({ method: 'GET', url: '/v1/reports/users' });
    expect(routeOf('getTeamReports')).toMatchObject({ method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}/reports' });
    expect(routeOf('getTeamHealthLatest').url).toMatch(/healthModelId/);
    expect(routeOf('getTeamHealthHistorical').url).toMatch(/healthModelId/);
  });

  it('team health ops use healthModelId path param (exact name from OpenAPI)', () => {
    expect(routeOf('getTeamHealthLatest').url).toBe('=/v1/reports/health/{{$parameter.healthModelId}}/team-health-latest');
    expect(routeOf('getTeamHealthHistorical').url).toBe('=/v1/reports/health/{{$parameter.healthModelId}}/team-health-historical');
  });

  it('healthModelId is a required string field shown for health ops', () => {
    const f = reportFields.find(
      (f) => f.name === 'healthModelId' &&
        (f.displayOptions?.show as any)?.operation?.includes('getTeamHealthLatest')
    );
    expect(f).toBeDefined();
    expect(f?.required).toBe(true);
    expect(f?.type).toBe('string');
    const f2 = reportFields.find(
      (f) => f.name === 'healthModelId' &&
        (f.displayOptions?.show as any)?.operation?.includes('getTeamHealthHistorical')
    );
    expect(f2).toBeDefined();
  });

  it('getTeamReports paginates with returnAll + limit + offsetPagination', () => {
    const returnAllField = reportFields.find(
      (f) => f.name === 'returnAll' && (f.displayOptions?.show as any)?.operation?.includes('getTeamReports')
    );
    expect(returnAllField).toBeDefined();
    const routing = opOf('getTeamReports')?.routing;
    expect(routing?.operations?.pagination?.type).toBe('offset');
    expect(routing?.operations?.pagination?.properties?.pageSize).toBe(20);
    expect(routing?.output?.postReceive?.[0]?.type).toBe('rootProperty');
  });

  it('getTeamReports requires teamId string field', () => {
    const f = reportFields.find(
      (f) => f.name === 'teamId' && (f.displayOptions?.show as any)?.operation?.includes('getTeamReports')
    );
    expect(f).toBeDefined();
    expect(f?.required).toBe(true);
    expect(f?.type).toBe('string');
  });

  it('non-paginating ops have no returnAll', () => {
    const nonPaginating = opValues.filter((v: string) => v !== 'getTeamReports');
    for (const op of nonPaginating) {
      const opRouting = opOf(op)?.routing;
      expect(opRouting?.operations?.pagination, `op ${op}`).toBeUndefined();
    }
  });

  it('getTeamOverview has no postReceive (bare response)', () => {
    const routing = opOf('getTeamOverview')?.routing;
    expect(routing?.output?.postReceive).toBeUndefined();
  });

  it('getRetrospectiveActivity filters include dateFrom and dateTo', () => {
    const f = filtersFor('getRetrospectiveActivity');
    expect(f).toBeDefined();
    const names = (f?.options as any[]).map((o: any) => o.name);
    expect(names).toContain('dateFrom');
    expect(names).toContain('dateTo');
  });

  it('getTeamReports filters include type, sort, comments', () => {
    const f = filtersFor('getTeamReports');
    expect(f).toBeDefined();
    const names = (f?.options as any[]).map((o: any) => o.name);
    expect(names).toContain('comments');
    expect(names).toContain('sort');
    expect(names).toContain('type');
  });

  it('CSV ops have json:false; getTeamReports and getTeamOverview do not', () => {
    const csvOps = ['getTeamActivity', 'getTeamActionActivity', 'getRetrospectiveActivity',
      'getHealthCheckActivity', 'getTeamHealthLatest', 'getTeamHealthHistorical', 'getUsers'];
    for (const op of csvOps) {
      expect(routeOf(op)?.json, `op ${op} should have json:false`).toBe(false);
    }
    expect(routeOf('getTeamReports')?.json).toBeUndefined();
    expect(routeOf('getTeamOverview')?.json).toBeUndefined();
  });

  it('getTeamReports has no additionalFields (outputFormat removed)', () => {
    const f = reportFields.find(
      (f) => f.name === 'additionalFields' && (f.displayOptions?.show as any)?.operation?.includes('getTeamReports')
    );
    expect(f).toBeUndefined();
  });
});
