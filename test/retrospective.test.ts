// test/retrospective.test.ts
import { describe, it, expect } from 'vitest';
import {
  retrospectiveOperations,
  retrospectiveFields,
} from '../nodes/TeamRetro/descriptions/Retrospective';

const opValues = (retrospectiveOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (retrospectiveOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

describe('Retrospective resource', () => {
  it('exposes the 12 retrospective operations in alphabetical order', () => {
    expect(opValues).toEqual([
      'captureIdea',
      'create',
      'delete',
      'deleteIdea',
      'get',
      'getAll',
      'getReport',
      'getSummary',
      'removeVote',
      'update',
      'updateIdea',
      'vote',
    ]);
  });

  it('routes each operation to the right method + path', () => {
    expect(routeOf('getAll')).toMatchObject({ method: 'GET', url: '/v1/retrospectives' });
    expect(routeOf('create')).toMatchObject({ method: 'POST', url: '/v1/retrospectives' });
    expect(routeOf('get')).toMatchObject({
      method: 'GET',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('update')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('delete')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}',
    });
    expect(routeOf('captureIdea')).toMatchObject({
      method: 'POST',
      url: '=/v1/teams/{{$parameter.teamId}}/captured-ideas',
    });
    expect(routeOf('updateIdea')).toMatchObject({
      method: 'PATCH',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/ideas/{{$parameter.ideaSlug}}',
    });
    expect(routeOf('deleteIdea')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/ideas/{{$parameter.ideaSlug}}',
    });
    expect(routeOf('vote')).toMatchObject({
      method: 'POST',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/votes/{{$parameter.targetSlug}}',
    });
    expect(routeOf('removeVote')).toMatchObject({
      method: 'DELETE',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/votes/{{$parameter.targetSlug}}',
    });
    expect(routeOf('getReport')).toMatchObject({
      method: 'GET',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/report.md',
    });
    expect(routeOf('getSummary')).toMatchObject({
      method: 'GET',
      url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/summary.md',
    });
  });

  it('markdown ops include the Accept header and json:false', () => {
    expect(routeOf('getReport')).toMatchObject({
      headers: { Accept: 'text/markdown' },
      json: false,
    });
    expect(routeOf('getSummary')).toMatchObject({
      headers: { Accept: 'text/markdown' },
      json: false,
    });
  });

  it('delete ops use deletedTrue postReceive', () => {
    const opRouting = (op: string) =>
      (retrospectiveOperations.options as any[]).find((o) => o.value === op)?.routing;
    expect(opRouting('delete').output.postReceive[0].type).toBe('set');
    expect(opRouting('deleteIdea').output.postReceive[0].type).toBe('set');
    expect(opRouting('removeVote').output.postReceive[0].type).toBe('set');
  });

  it('getAll uses rootPropertyData postReceive', () => {
    const getAllRouting = (retrospectiveOperations.options as any[]).find(
      (o) => o.value === 'getAll'
    )?.routing;
    expect(getAllRouting.output.postReceive[0].type).toBe('rootProperty');
  });

  it('captureIdea requires a title field routed to the body', () => {
    const title = retrospectiveFields.find(
      (f) =>
        f.name === 'title' &&
        (f.displayOptions?.show as any)?.operation?.includes('captureIdea')
    );
    expect(title?.required).toBe(true);
    expect((title as any)?.routing?.send).toMatchObject({ type: 'body', property: 'title' });
  });

  it('updateIdea requires an ideaTitle field routed to the body as title', () => {
    const ideaTitle = retrospectiveFields.find((f) => f.name === 'ideaTitle');
    expect(ideaTitle?.required).toBe(true);
    expect((ideaTitle as any)?.routing?.send).toMatchObject({ type: 'body', property: 'title' });
  });
});
