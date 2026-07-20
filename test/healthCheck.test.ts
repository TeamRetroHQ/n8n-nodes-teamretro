// test/healthCheck.test.ts
import { describe, it, expect } from 'vitest';
import { healthCheckOperations, healthCheckFields } from '../nodes/TeamRetro/descriptions/HealthCheck';

const opValues = (healthCheckOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (healthCheckOperations.options as any[]).find((o) => o.value === op)?.routing?.request;
const opOf = (op: string) =>
  (healthCheckOperations.options as any[]).find((o) => o.value === op)?.routing?.operations;
const outputOf = (op: string) =>
  (healthCheckOperations.options as any[]).find((o) => o.value === op)?.routing?.output;

describe('Health Check resource', () => {
  it('exposes 9 operations in alphabetical display-name order', () => {
    expect(opValues).toEqual([
      'addDimensionFeedback',
      'create',
      'delete',
      'get',
      'getAll',
      'getAllDimensions',
      'getReport',
      'getSummary',
      'update',
    ]);
  });

  it('default operation is getAll', () => {
    expect(healthCheckOperations.default).toBe('getAll');
  });

  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/health-checks' });
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '/v1/health-checks' });
    expect(routeOf('get')).toMatchObject({
      method: 'GET',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('update')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('delete')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('getAllDimensions')).toMatchObject({
      method: 'GET',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}/dimensions',
    });
    expect(routeOf('getReport')).toMatchObject({
      method: 'GET',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}/report.md',
    });
    expect(routeOf('getSummary')).toMatchObject({
      method: 'GET',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}/summary.md',
    });
    expect(routeOf('addDimensionFeedback')).toMatchObject({
      method: 'PUT',
      url: '=/v1/health-checks/{{$parameter.meetingSlug}}/dimensions/{{$parameter.dimensionSlug}}/comments',
    });
  });

  it('delete uses deletedTrue postReceive', () => {
    expect(outputOf('delete')?.postReceive?.[0]?.type).toBe('set');
  });

  it('getAll and getAllDimensions use offsetPagination + rootPropertyData', () => {
    expect(opOf('getAll')?.pagination?.type).toBe('offset');
    expect(outputOf('getAll')?.postReceive?.[0]?.type).toBe('rootProperty');
    expect(opOf('getAllDimensions')?.pagination?.type).toBe('offset');
    expect(outputOf('getAllDimensions')?.postReceive?.[0]?.type).toBe('rootProperty');
  });

  it('getReport and getSummary use markdownResponse (json:false, set postReceive)', () => {
    expect(routeOf('getReport')?.json).toBe(false);
    expect(outputOf('getReport')?.postReceive?.[0]?.type).toBe('set');
    expect(routeOf('getSummary')?.json).toBe(false);
    expect(outputOf('getSummary')?.postReceive?.[0]?.type).toBe('set');
  });

  it('meetingSlug field shown for non-getAll, non-create ops', () => {
    const meetingSlug = healthCheckFields.find((f) => f.name === 'meetingSlug');
    expect(meetingSlug).toBeDefined();
    expect(meetingSlug?.required).toBe(true);
    const shownOps = (meetingSlug?.displayOptions?.show as any)?.operation ?? [];
    expect(shownOps).toContain('get');
    expect(shownOps).toContain('update');
    expect(shownOps).toContain('delete');
    expect(shownOps).toContain('addDimensionFeedback');
    expect(shownOps).toContain('getAllDimensions');
    expect(shownOps).toContain('getReport');
    expect(shownOps).toContain('getSummary');
    expect(shownOps).not.toContain('getAll');
    expect(shownOps).not.toContain('create');
  });

  it('dimensionSlug field shown only for addDimensionFeedback', () => {
    const dim = healthCheckFields.find((f) => f.name === 'dimensionSlug');
    expect(dim).toBeDefined();
    expect(dim?.required).toBe(true);
    const shownOps = (dim?.displayOptions?.show as any)?.operation ?? [];
    expect(shownOps).toEqual(['addDimensionFeedback']);
  });

  it('addDimensionFeedback body fields (body, rating) are present', () => {
    const feedback = healthCheckFields.find((f) => f.name === 'feedbackFields');
    expect(feedback).toBeDefined();
    const bodyField = (feedback as any)?.options?.find((o: any) => o.name === 'body');
    const ratingField = (feedback as any)?.options?.find((o: any) => o.name === 'rating');
    expect(bodyField).toBeDefined();
    expect(ratingField).toBeDefined();
  });

  it('create required field is teamId', () => {
    const teamId = healthCheckFields.find(
      (f) => f.name === 'teamId' && (f.displayOptions?.show as any)?.operation?.includes('create'),
    );
    expect(teamId?.required).toBe(true);
    expect((teamId as any)?.routing?.send).toMatchObject({ type: 'body', property: 'teamId' });
  });

  it('getAll teamIds/teamTags/healthModelIds filters send raw comma query strings (no array split)', () => {
    const filters = healthCheckFields.find(
      (f) =>
        f.name === 'filters' && (f.displayOptions?.show as any)?.operation?.includes('getAll'),
    );
    for (const prop of ['teamIds', 'teamTags', 'healthModelIds']) {
      const opt = (filters as any)?.options?.find((o: any) => o.name === prop);
      expect(opt?.routing?.send).toEqual({ type: 'query', property: prop });
    }
  });
});
