import type { INodeProperties } from 'n8n-workflow';
import { returnAll, limit, csvToArray } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['search'], operation } });

// Note: two rootProperty steps because the search envelope is { success, data: { results, pagination } }
// first extract data, then results — dot notation is not supported by IPostReceiveRootProperty
const extractData = { type: 'rootProperty' as const, properties: { property: 'data' as const } };
const extractResults = { type: 'rootProperty' as const, properties: { property: 'results' as const } };

export const searchOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['search'] } },
  default: 'search',
  options: [
    {
      name: 'Search',
      value: 'search',
      action: 'Search across teams',
      routing: {
        request: { method: 'POST', url: '/v1/search' },
        operations: {
          pagination: {
            type: 'generic',
            properties: {
              continue: '={{ $response.body.data.pagination.hasMore === true }}',
              request: {
                body: {
                  offset:
                    '={{ ($response.body.data.pagination.offset ?? 0) + ($response.body.data.pagination.limit ?? 50) }}',
                },
              },
            },
          },
        },
        output: { postReceive: [extractData, extractResults] },
      },
    },
  ],
};

// Local limit for Search — sends to body instead of query
const searchLimit: INodeProperties = {
  ...limit,
  default: 20, // matches the OpenAPI /v1/search default
  routing: { send: { type: 'body', property: 'limit' } },
};

export const searchFields: INodeProperties[] = [
  // ---- Query (required) ----
  {
    displayName: 'Query',
    name: 'queryText',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. deployment issues',
    displayOptions: show(['search']),
    routing: { send: { type: 'body', property: 'queryText' } },
    description:
      'Free-text search query — ideas, actions, and comments are matched by keyword or meaning. Returns 403 Forbidden when the search feature is not enabled for the account (check that <code>search.enabled</code> is active).',
  },
  // ---- Return All / Limit ----
  { ...returnAll, displayOptions: show(['search']) },
  {
    ...searchLimit,
    displayOptions: { show: { resource: ['search'], operation: ['search'], returnAll: [false] } },
  },
  // ---- Additional Fields ----
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['search']),
    options: [
      {
        displayName: 'Exclude Team IDs',
        name: 'excludeTeamIds',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars,xY9zA...22chars',
        description: 'Comma-separated team IDs, slugs, or names to exclude from results',
        routing: {
          send: {
            type: 'body',
            property: 'excludeTeamIds',
            value: csvToArray,
          },
        },
      },
      {
        displayName: 'Period End',
        name: 'periodEnd',
        type: 'dateTime',
        default: '',
        description: 'Only include items created or last edited on or before this date (YYYY-MM-DD)',
        routing: {
          send: {
            type: 'body',
            property: 'periodEnd',
            value: `={{ $value ? $value.split("T")[0] : undefined }}`,
          },
        },
      },
      {
        displayName: 'Period Start',
        name: 'periodStart',
        type: 'dateTime',
        default: '',
        description: 'Only include items created or last edited on or after this date (YYYY-MM-DD)',
        routing: {
          send: {
            type: 'body',
            property: 'periodStart',
            value: `={{ $value ? $value.split("T")[0] : undefined }}`,
          },
        },
      },
      {
        displayName: 'Search Type',
        name: 'searchType',
        type: 'options',
        default: 'hybrid',
        description:
          'Search mode — hybrid blends full-text and semantic matching; text runs keyword search only; vector runs semantic (embedding) search only',
        options: [
          { name: 'Hybrid (Default)', value: 'hybrid' },
          { name: 'Text', value: 'text' },
          { name: 'Vector', value: 'vector' },
        ],
        routing: { send: { type: 'body', property: 'searchType' } },
      },
      {
        displayName: 'Sentiment',
        name: 'sentiment',
        type: 'options',
        default: '',
        description:
          'Restrict results to items with this overall sentiment — use negative for problems or blockers, positive for praise or wins, neutral for factual statements',
        options: [
          { name: 'Any', value: '' },
          { name: 'Negative', value: 'negative' },
          { name: 'Neutral', value: 'neutral' },
          { name: 'Positive', value: 'positive' },
        ],
        routing: {
          send: {
            type: 'body',
            property: 'sentiment',
            value: '={{ $value || undefined }}',
          },
        },
      },
      {
        displayName: 'Target Types',
        name: 'targetTypes',
        type: 'multiOptions',
        default: [],
        description: 'Restrict results to one or more annotation types',
        options: [
          { name: 'Action', value: 'Action' },
          { name: 'Comment', value: 'Comment' },
          { name: 'Idea', value: 'Idea' },
        ],
        routing: {
          send: {
            type: 'body',
            property: 'targetTypes',
            value: '={{ $value?.length ? $value : undefined }}',
          },
        },
      },
      {
        displayName: 'Team IDs',
        name: 'teamIds',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars,xY9zA...22chars',
        description: 'Comma-separated team IDs, slugs, or names to restrict results to',
        routing: {
          send: {
            type: 'body',
            property: 'teamIds',
            value: csvToArray,
          },
        },
      },
      {
        displayName: 'Team Tags',
        name: 'teamTags',
        type: 'string',
        default: '',
        placeholder: 'e.g. engineering,platform',
        description: 'Comma-separated team tags — restrict to teams carrying all listed tags',
        routing: {
          send: {
            type: 'body',
            property: 'teamTags',
            value: csvToArray,
          },
        },
      },
      {
        displayName: 'User ID',
        name: 'userId',
        type: 'string',
        default: '',
        placeholder: 'e.g. usr_aB3dE...',
        description: "Restrict results to this user's contributions (ideas and comments they authored, and actions assigned to them)",
        routing: { send: { type: 'body', property: 'userId' } },
      },
    ],
  },
];
