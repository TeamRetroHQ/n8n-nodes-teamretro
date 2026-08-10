import type { INodeProperties } from 'n8n-workflow';
import {
  rootPropertyData,
  dateFromFilter as dateFrom,
  dateToFilter as dateTo,
  teamIdsFilter as teamIds,
  teamTagsFilter as teamTags,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['insight'], operation } });

export const insightOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['insight'] } },
  default: 'getAccount',
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
      // Both filters are metric-scoped: the API 400s if `healthModelIds` is sent with a
      // metric other than health_latest/health_trend, or `series` with anything but
      // actions_trend. `/metric` reads the root-level Metric parameter.
      {
        displayName: 'Health Model IDs',
        name: 'healthModelIds',
        type: 'string' as const,
        default: '',
        displayOptions: { show: { '/metric': ['health_latest', 'health_trend'] } },
        description: 'Comma-separated health model IDs to filter by',
        routing: { send: { type: 'query' as const, property: 'healthModelIds' } },
      },
      {
        displayName: 'Series',
        name: 'series',
        type: 'string' as const,
        default: '',
        placeholder: 'e.g. open,created',
        displayOptions: { show: { '/metric': ['actions_trend'] } },
        description:
          'Comma-delimited subset of action trend series to return: open, created, published',
        routing: { send: { type: 'query' as const, property: 'series' } },
      },
      teamIds,
      teamTags,
    ],
  },
];
