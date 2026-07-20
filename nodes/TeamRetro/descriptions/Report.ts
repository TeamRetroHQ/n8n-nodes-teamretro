import type { INodeProperties } from 'n8n-workflow';
import {
  returnAll,
  limit,
  offsetPagination,
  rootPropertyData,
  dateFromFilter as dateFrom,
  dateToFilter as dateTo,
  teamIdsFilter as teamIds,
  teamTagsFilter as teamTags,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['report'], operation } });

// Pagination capped at 20 per page per OpenAPI spec
const teamReportsPagination = {
  ...offsetPagination,
  properties: { ...offsetPagination.properties, pageSize: 20 },
};

export const reportOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['report'] } },
  default: 'getTeamOverview',
  options: [
    {
      name: 'Get Health Check Activity Report',
      value: 'getHealthCheckActivity',
      action: 'Get health check activity report',
      routing: {
        request: { method: 'GET', url: '/v1/reports/health-check-activity', json: false },
      },
    },
    {
      name: 'Get Retrospective Activity Report',
      value: 'getRetrospectiveActivity',
      action: 'Get retrospective activity report',
      routing: {
        request: { method: 'GET', url: '/v1/reports/retrospective-activity', json: false },
      },
    },
    {
      name: 'Get Team Action Activity Report',
      value: 'getTeamActionActivity',
      action: 'Get team action activity report',
      routing: {
        request: { method: 'GET', url: '/v1/reports/team-action-activity', json: false },
      },
    },
    {
      name: 'Get Team Activity Report',
      value: 'getTeamActivity',
      action: 'Get team activity report',
      routing: {
        request: { method: 'GET', url: '/v1/reports/team-activity', json: false },
      },
    },
    {
      name: 'Get Team Health (Historical) Report',
      value: 'getTeamHealthHistorical',
      action: 'Get team health historical report',
      routing: {
        request: { method: 'GET', url: '=/v1/reports/health/{{$parameter.healthModelId}}/team-health-historical', json: false },
      },
    },
    {
      name: 'Get Team Health (Latest) Report',
      value: 'getTeamHealthLatest',
      action: 'Get team health latest report',
      routing: {
        request: { method: 'GET', url: '=/v1/reports/health/{{$parameter.healthModelId}}/team-health-latest', json: false },
      },
    },
    {
      name: 'Get Team Overview Report',
      value: 'getTeamOverview',
      action: 'Get team overview report',
      routing: {
        // Note: bare object response (no { success, data } wrapper) — no postReceive
        request: { method: 'GET', url: '/v1/reports/team-overview' },
      },
    },
    {
      name: 'Get Team Reports (Batch)',
      value: 'getTeamReports',
      action: 'Get team reports batch',
      // Note: markdown output not expressible declaratively (no header send-type); JSON only.
      routing: {
        request: { method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}/reports' },
        operations: { pagination: teamReportsPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Users Report',
      value: 'getUsers',
      action: 'Get users report',
      routing: {
        request: { method: 'GET', url: '/v1/reports/users', json: false },
      },
    },
  ],
};

export const reportFields: INodeProperties[] = [
  // ---- Health model ID (team-health ops) ----
  {
    displayName: 'Health Model ID',
    name: 'healthModelId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['getTeamHealthLatest', 'getTeamHealthHistorical']),
    description: 'The 22-character encoded health model ID',
  },
  // ---- Team ID (Team Reports Batch) ----
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['getTeamReports']),
    description: 'The 22-character encoded team ID',
  },
  // ---- Team Reports Batch: pagination ----
  { ...returnAll, displayOptions: show(['getTeamReports']) },
  {
    ...limit,
    typeOptions: { minValue: 1, maxValue: 20 },
    default: 20,
    displayOptions: {
      show: { resource: ['report'], operation: ['getTeamReports'], returnAll: [false] },
    },
  },
  // ---- Team Reports Batch: filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getTeamReports']),
    options: [
      {
        displayName: 'Comments',
        name: 'comments',
        type: 'boolean',
        default: false,
        description: 'Whether to include idea/comment threads in each report',
        routing: { send: { type: 'query' as const, property: 'comments' } },
      },
      dateFrom,
      dateTo,
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        default: '-date',
        description: 'Sort order by meeting date',
        options: [
          { name: 'Newest First', value: '-date' },
          { name: 'Oldest First', value: 'date' },
        ],
        routing: { send: { type: 'query' as const, property: 'sort' } },
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'string',
        default: '',
        placeholder: 'e.g. retrospective,healthCheck',
        description: 'Comma-delimited meeting types to include: retrospective, healthCheck, estimation, all',
        routing: { send: { type: 'query' as const, property: 'type' } },
      },
    ],
  },
  // ---- Team Overview filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getTeamOverview']),
    options: [teamIds, teamTags],
  },
  // ---- Team Activity filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getTeamActivity']),
    options: [teamIds, teamTags],
  },
  // ---- Team Action Activity filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getTeamActionActivity']),
    options: [teamIds, teamTags],
  },
  // ---- Retrospective Activity filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getRetrospectiveActivity']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
  // ---- Health Check Activity filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getHealthCheckActivity']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
  // ---- Team Health Latest filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getTeamHealthLatest']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
  // ---- Team Health Historical filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getTeamHealthHistorical']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
  // ---- Users Report filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getUsers']),
    options: [teamIds, teamTags],
  },
];
