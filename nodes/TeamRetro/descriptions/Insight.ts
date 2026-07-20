import type { INodeProperties } from 'n8n-workflow';
import {
  rootPropertyData,
  dateFromFilter as dateFrom,
  dateToFilter as dateTo,
  teamIdsFilter as teamIds,
  teamTagsFilter as teamTags,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['insight'], operation } });

const healthModelIds = {
  displayName: 'Health Model IDs',
  name: 'healthModelIds',
  type: 'string' as const,
  default: '',
  description: 'Comma-separated health model IDs to filter by',
  routing: { send: { type: 'query' as const, property: 'healthModelIds' } },
};

const series = {
  displayName: 'Series',
  name: 'series',
  type: 'string' as const,
  default: '',
  placeholder: 'e.g. open,created',
  description: 'Comma-delimited subset of action trend series to return: open, created, published',
  routing: { send: { type: 'query' as const, property: 'series' } },
};

export const insightOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['insight'] } },
  default: 'getActivity',
  options: [
    {
      name: 'Get Account Insights',
      value: 'getAccount',
      action: 'Get account insights',
      routing: {
        request: { method: 'GET', url: '/v1/insights/account' },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Action Insights',
      value: 'getActions',
      action: 'Get action insights',
      routing: {
        request: { method: 'GET', url: '/v1/insights/actions' },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Action Trends',
      value: 'getActionTrends',
      action: 'Get action trends',
      routing: {
        request: { method: 'GET', url: '/v1/insights/actions/trends' },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Activity Insights',
      value: 'getActivity',
      action: 'Get activity insights',
      routing: {
        request: { method: 'GET', url: '/v1/insights/activity' },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Health Rating Trends',
      value: 'getHealthTrends',
      action: 'Get health rating trends',
      routing: {
        request: { method: 'GET', url: '/v1/insights/health/trends' },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Latest Health Ratings',
      value: 'getHealthLatest',
      action: 'Get latest health ratings',
      routing: {
        request: { method: 'GET', url: '/v1/insights/health/latest' },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Meeting Cadence',
      value: 'getMeetingCadence',
      action: 'Get meeting cadence',
      routing: {
        request: { method: 'GET', url: '/v1/insights/meeting-cadence' },
        output: { postReceive: [rootPropertyData] },
      },
    },
  ],
};

export const insightFields: INodeProperties[] = [
  // ---- Get Account Insights: required metric (OpenAPI: required, enum) ----
  {
    displayName: 'Metric',
    name: 'metric',
    type: 'options',
    required: true,
    default: 'activity',
    displayOptions: show(['getAccount']),
    description: 'Which account metric to return',
    options: [
      { name: 'Actions', value: 'actions' },
      { name: 'Actions Trend', value: 'actions_trend' },
      { name: 'Activity', value: 'activity' },
      { name: 'Cadence', value: 'cadence' },
      { name: 'Health Latest', value: 'health_latest' },
      { name: 'Health Trend', value: 'health_trend' },
    ],
    routing: { send: { type: 'query' as const, property: 'metric' } },
  },
  // ---- Get Account Insights: optional filters ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAccount']),
    options: [
      dateFrom,
      dateTo,
      healthModelIds,
      {
        ...series,
        description: 'Comma-delimited subset of action trend series to return: open, created, published (applies to actions_trend metric)',
      },
      teamIds,
      teamTags,
    ],
  },
  // ---- Get Action Insights ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getActions']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
  // ---- Get Action Trends ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getActionTrends']),
    options: [dateFrom, dateTo, series, teamIds, teamTags],
  },
  // ---- Get Activity Insights ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getActivity']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
  // ---- Get Health Rating Trends ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getHealthTrends']),
    options: [dateFrom, dateTo, healthModelIds, teamIds, teamTags],
  },
  // ---- Get Latest Health Ratings ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getHealthLatest']),
    options: [dateFrom, dateTo, healthModelIds, teamIds, teamTags],
  },
  // ---- Get Meeting Cadence ----
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getMeetingCadence']),
    options: [dateFrom, dateTo, teamIds, teamTags],
  },
];
