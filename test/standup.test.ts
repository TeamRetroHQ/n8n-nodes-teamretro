import { describe, it, expect } from 'vitest';
import { NodeHelpers, type INode } from 'n8n-workflow';
import { standupOperations, standupFields } from '../nodes/TeamRetro/descriptions/Standup';
import { TeamRetro } from '../nodes/TeamRetro/TeamRetro.node';

const opValues = (standupOperations.options ?? []).map((o: any) => o.value);
const routeOf = (op: string) =>
  (standupOperations.options as any[]).find((o) => o.value === op)?.routing?.request;

// Evaluate a `={{ ... }}` routing expression as plain JS with $value bound.
const run = (expr: string, $value: unknown) =>
  new Function('$value', `return ${expr.slice(3, -2)}`)($value);

const teamId = standupFields.find((f) => f.name === 'teamId') as any;
const topics = standupFields.find((f) => f.name === 'topics') as any;
const additional = (standupFields.find((f) => f.name === 'additionalFields') as any).options as any[];
const weekdays = additional.find((o) => o.name === 'weekdays');

// Build a Create body from Additional Fields the way n8n's routing does: each value through its
// `routing.send.value` expression, written at its dotted `property` path (n8n uses lodash `set`),
// then serialized, which drops undefined.
const bodyFrom = (values: Record<string, unknown>) => {
  const body: Record<string, any> = {};
  for (const [name, value] of Object.entries(values)) {
    const send = additional.find((o) => o.name === name).routing.send;
    const sent = send.value ? run(send.value, value) : value;
    const path = send.property.split('.');
    const key = path.pop();
    let target = body;
    for (const segment of path) target = target[segment] ??= {};
    target[key] = sent;
  }
  return JSON.parse(JSON.stringify(body));
};

// The parameter issues n8n reports on Topics, from its own validator. n8n refuses to run a node
// that has any.
const description = new TeamRetro().description;
const topicIssues = (count: number) => {
  const node: INode = {
    id: 'standup-create',
    name: 'TeamRetro',
    type: description.name,
    typeVersion: description.version as number,
    position: [0, 0],
    parameters: {
      resource: 'standup',
      operation: 'create',
      teamId: { __rl: true, mode: 'id', value: 'aB3dE12345678901234AB1' },
      topics: count
        ? { topic: Array.from({ length: count }, (_, i) => ({ title: `Topic ${i + 1}` })) }
        : {},
    },
  };
  return NodeHelpers.getNodeParametersIssues(description.properties, node, description)?.parameters
    ?.topics;
};

describe('Standup resource', () => {
  it('exposes only the API-key operations', () => {
    expect(opValues).toEqual(['create', 'getAll']);
  });
  it('routes both operations under the team', () => {
    expect(routeOf('getAll')).toMatchObject({
      method: 'GET',
      url: '=/v1/teams/{{$parameter.teamId}}/standups',
    });
    expect(routeOf('create')).toMatchObject({
      method: 'POST',
      url: '=/v1/teams/{{$parameter.teamId}}/standups',
    });
  });
  it('picks the team from a list or by ID, as Team does', () => {
    expect(teamId.type).toBe('resourceLocator');
    expect(teamId.displayOptions.show.operation).toEqual(['create', 'getAll']);
    expect(teamId.modes.map((m: any) => m.name)).toEqual(['list', 'id']);
    expect(teamId.modes[0].typeOptions.searchListMethod).toBe('searchTeams');
  });
  it('maps the Topics collection to the API topics array', () => {
    const body = run(topics.routing.send.value, {
      topic: [
        { title: 'Yesterday', description: '', flag: 'done' },
        { title: 'Blockers?', description: 'Anything in your way', flag: 'blocked' },
        { title: 'Anything else?', description: '', flag: '' },
      ],
    });
    expect(JSON.parse(JSON.stringify(body))).toEqual([
      { title: 'Yesterday', flags: ['done'] },
      { title: 'Blockers?', description: 'Anything in your way', flags: ['blocked'] },
      { title: 'Anything else?' },
    ]);
  });
  it('flags fewer than 1 or more than 10 topics before the node runs', () => {
    expect(topicIssues(0)).toEqual(['At least 1 field is required.']);
    expect(topicIssues(11)).toEqual(['At most 10 fields are allowed.']);
    expect(topicIssues(1)).toBeUndefined();
    expect(topicIssues(10)).toBeUndefined();
  });
  it('merges Timezone and Meets On into one schedule object', () => {
    expect(
      bodyFrom({
        title: 'Platform Standup',
        description: 'Daily check-in',
        timezone: 'Australia/Perth',
        weekdays: ['mon', 'wed'],
      }),
    ).toEqual({
      title: 'Platform Standup',
      description: 'Daily check-in',
      schedule: {
        timezone: 'Australia/Perth',
        recurrence: { freq: 'week', interval: 1, weekdays: ['mon', 'wed'] },
      },
    });
  });
  it('sends Meets On as a weekly recurrence, daily for all seven days, nothing when empty', () => {
    expect(run(weekdays.routing.send.value, ['mon', 'wed'])).toEqual({
      freq: 'week',
      interval: 1,
      weekdays: ['mon', 'wed'],
    });
    expect(
      run(weekdays.routing.send.value, ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
    ).toEqual({ freq: 'day', interval: 1 });
    expect(run(weekdays.routing.send.value, [])).toBeUndefined();
  });
  it('leaves a blank Title out so TeamRetro applies its default', () => {
    expect(bodyFrom({ title: '' })).toEqual({});
  });
});
