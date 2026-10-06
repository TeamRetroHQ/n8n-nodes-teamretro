import type { INodeProperties } from 'n8n-workflow';
import { rootPropertyData, teamLocator } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['standup'], operation } });

// Only the series endpoints take an API key. Reading or posting a day's updates
// (/v1/standups/{id}/updates) needs an OAuth user token, so those operations are not exposed.
export const standupOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['standup'] } },
  default: 'getAll',
  options: [
    {
      name: 'Create',
      value: 'create',
      action: 'Create standup',
      routing: { request: { method: 'POST', url: '=/v1/teams/{{$parameter.teamId}}/standups' } },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many standups',
      // Unpaginated: the endpoint returns every standup the team runs.
      routing: {
        request: { method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}/standups' },
        output: { postReceive: [rootPropertyData] },
      },
    },
  ],
};

export const standupFields: INodeProperties[] = [
  // ---- Team (all operations) ----
  { ...teamLocator, displayOptions: show(['create', 'getAll']) },
  // ---- Create ----
  {
    displayName: 'Topics',
    name: 'topics',
    type: 'fixedCollection',
    required: true,
    default: {},
    // n8n's `required` does not check a multi-value fixedCollection; these counts do, and n8n
    // refuses to run the node until they hold. The API takes 1–10 topics.
    typeOptions: { multipleValues: true, minRequiredFields: 1, maxAllowedFields: 10 },
    displayOptions: show(['create']),
    description: 'The questions participants answer each day, in display order (1–10)',
    options: [
      {
        name: 'topic',
        displayName: 'Topic',
        values: [
          {
            displayName: 'Title',
            name: 'title',
            type: 'string',
            required: true,
            default: '',
            placeholder: 'e.g. What are you working on today?',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
            description: 'Supporting text shown under the topic',
          },
          {
            displayName: 'Role',
            name: 'flag',
            type: 'options',
            default: '',
            description: 'What the topic is for. Each role goes on one topic at most.',
            options: [
              { name: 'Blocked', value: 'blocked', description: 'The blocker question' },
              {
                name: 'Doing',
                value: 'doing',
                description: 'Work in progress, offered for carry-forward at the next standup',
              },
              { name: 'Done', value: 'done', description: 'Work finished since the last standup' },
              { name: 'None', value: '' },
            ],
          },
        ],
      },
    ],
    routing: {
      send: {
        type: 'body',
        property: 'topics',
        value:
          '={{ ($value.topic || []).map((t) => ({ title: t.title, description: t.description || undefined, flags: t.flag ? [t.flag] : undefined })) }}',
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['create']),
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'description' } },
      },
      {
        displayName: 'Meets On',
        name: 'weekdays',
        type: 'multiOptions',
        default: [],
        description: 'Weekdays the standup meets on. Leave empty, or pick all seven, to meet every day.',
        options: [
          { name: 'Friday', value: 'fri' },
          { name: 'Monday', value: 'mon' },
          { name: 'Saturday', value: 'sat' },
          { name: 'Sunday', value: 'sun' },
          { name: 'Thursday', value: 'thu' },
          { name: 'Tuesday', value: 'tue' },
          { name: 'Wednesday', value: 'wed' },
        ],
        routing: {
          send: {
            type: 'body',
            property: 'schedule.recurrence',
            // All seven days is a daily standup: as a weekly rule TeamRetro would title it "Weekly Standup".
            value:
              "={{ $value?.length === 7 ? { freq: 'day', interval: 1 } : $value?.length ? { freq: 'week', interval: 1, weekdays: $value } : undefined }}",
          },
        },
      },
      {
        displayName: 'Timezone',
        name: 'timezone',
        type: 'string',
        default: '',
        placeholder: 'e.g. Australia/Perth',
        description: 'IANA timezone the schedule runs in. Defaults to UTC.',
        routing: { send: { type: 'body', property: 'schedule.timezone' } },
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        description: 'Defaults to "Daily Standup" when it meets every day or every weekday, otherwise "Weekly Standup"',
        // Blank is left out so TeamRetro applies its default; it rejects an empty title.
        routing: { send: { type: 'body', property: 'title', value: '={{ $value || undefined }}' } },
      },
    ],
  },
];
