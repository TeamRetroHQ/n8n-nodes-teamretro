import type { INodeProperties } from 'n8n-workflow';
import {
  paginationFields,
  offsetPagination,
  deletedTrue,
  rootPropertyData,
  markdownResponse,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['healthCheck'], operation } });

export const healthCheckOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['healthCheck'] } },
  default: 'getAll',
  options: [
    {
      name: 'Add Dimension Feedback',
      value: 'addDimensionFeedback',
      action: 'Add dimension feedback',
      routing: {
        request: {
          method: 'PUT',
          url: '=/v1/health-checks/{{$parameter.meetingSlug}}/dimensions/{{$parameter.dimensionSlug}}/comments',
        },
      },
    },
    {
      name: 'Create',
      value: 'create',
      action: 'Create health check',
      routing: { request: { method: 'POST', url: '/v1/health-checks' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete health check',
      routing: {
        request: { method: 'DELETE', url: '=/v1/health-checks/{{$parameter.meetingSlug}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get health check',
      routing: {
        request: { method: 'GET', url: '=/v1/health-checks/{{$parameter.meetingSlug}}' },
      },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many health checks',
      routing: {
        request: { method: 'GET', url: '/v1/health-checks' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Many Dimensions',
      value: 'getAllDimensions',
      action: 'Get many dimensions',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/health-checks/{{$parameter.meetingSlug}}/dimensions',
        },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Report (Markdown)',
      value: 'getReport',
      action: 'Get report as markdown',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/health-checks/{{$parameter.meetingSlug}}/report.md',
          ...markdownResponse.request,
        },
        output: markdownResponse.output,
      },
    },
    {
      name: 'Get Summary (Markdown)',
      value: 'getSummary',
      action: 'Get summary as markdown',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/health-checks/{{$parameter.meetingSlug}}/summary.md',
          ...markdownResponse.request,
        },
        output: markdownResponse.output,
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update health check',
      routing: {
        request: { method: 'PATCH', url: '=/v1/health-checks/{{$parameter.meetingSlug}}' },
      },
    },
  ],
};

export const healthCheckFields: INodeProperties[] = [
  // ---- meetingSlug (most ops except getAll + create) ----
  {
    displayName: 'Health Check',
    name: 'meetingSlug',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    displayOptions: show([
      'addDimensionFeedback',
      'delete',
      'get',
      'getAllDimensions',
      'getReport',
      'getSummary',
      'update',
    ]),
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchHealthChecks', searchable: true },
      },
      {
        displayName: 'By ID or URL',
        name: 'id',
        type: 'string',
        extractValue: { type: 'regex', regex: '([a-zA-Z0-9]{22})' },
        placeholder: 'e.g. aB3dE... or https://.../health-check/aB3dE...',
      },
    ],
  },

  // ---- dimensionSlug (addDimensionFeedback only) ----
  {
    displayName: 'Dimension ID',
    name: 'dimensionSlug',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['addDimensionFeedback']),
    description: 'The 22-character encoded dimension ID',
  },

  // ---- Add Dimension Feedback body ----
  // OpenAPI: HealthCheckFeedbackWrite — body (string) and/or rating (integer 0-10); at least one required
  {
    displayName: 'Feedback Fields',
    name: 'feedbackFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['addDimensionFeedback']),
    options: [
      {
        displayName: 'Comment',
        name: 'body',
        type: 'string',
        default: '',
        description: 'Written feedback for this dimension (at least one of comment or rating is required)',
        routing: { send: { type: 'body', property: 'body' } },
      },
      {
        displayName: 'Rating',
        name: 'rating',
        type: 'number',
        default: 0,
        typeOptions: { minValue: 0, maxValue: 10 },
        description: 'Numeric rating for this dimension, 0–10 (at least one of comment or rating is required)',
        routing: { send: { type: 'body', property: 'rating' } },
      },
    ],
  },

  // ---- Get Many ----
  ...paginationFields('healthCheck', 'getAll'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAll']),
    options: [
      {
        displayName: 'Date From',
        name: 'dateFrom',
        type: 'dateTime',
        default: '',
        description: 'Return health checks on or after this date',
        routing: { send: { type: 'query', property: 'dateFrom' } },
      },
      {
        displayName: 'Date To',
        name: 'dateTo',
        type: 'dateTime',
        default: '',
        description: 'Return health checks on or before this date',
        routing: { send: { type: 'query', property: 'dateTo' } },
      },
      {
        displayName: 'Health Model IDs',
        name: 'healthModelIds',
        type: 'string',
        default: '',
        description: 'Comma-separated health model IDs to filter by',
        // Sent as a raw comma string (the API filter format); matches every other Get Many filter.
        routing: { send: { type: 'query', property: 'healthModelIds' } },
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        default: '-date',
        options: [
          { name: 'Date (Newest First)', value: '-date' },
          { name: 'Date (Oldest First)', value: 'date' },
          { name: 'Name (A–Z)', value: 'name' },
          { name: 'Name (Z–A)', value: '-name' },
        ],
        routing: { send: { type: 'query', property: 'sort' } },
      },
      {
        displayName: 'Team IDs',
        name: 'teamIds',
        type: 'string',
        default: '',
        description: 'Comma-separated team IDs to filter by',
        routing: { send: { type: 'query', property: 'teamIds' } },
      },
      {
        displayName: 'Team Tags',
        name: 'teamTags',
        type: 'string',
        default: '',
        description: 'Comma-separated tags to filter by',
        routing: { send: { type: 'query', property: 'teamTags' } },
      },
    ],
  },

  // ---- Get Many Dimensions ----
  ...paginationFields('healthCheck', 'getAllDimensions'),

  // ---- Create ----
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'teamId' } },
    description: 'ID of the team to create the health check in',
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
        displayName: 'Anonymity',
        name: 'anonymity',
        type: 'options',
        default: 'off',
        description: 'Anonymity mode for the health check',
        options: [
          { name: 'Aliases', value: 'aliases' },
          { name: 'Full', value: 'full' },
          { name: 'Off', value: 'off' },
        ],
        routing: { send: { type: 'body', property: 'anonymity' } },
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'Meeting date. Defaults to today (UTC).',
        routing: { send: { type: 'body', property: 'date' } },
      },
      {
        displayName: 'Health Model ID',
        name: 'healthModelId',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars',
        description: 'Health model to use. Provide this or "Use Last Health Model", not both.',
        routing: { send: { type: 'body', property: 'healthModelId' } },
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Meeting title. Defaults to "Team health check" when omitted.',
        routing: { send: { type: 'body', property: 'name' } },
      },
      {
        displayName: 'Use Last Health Model',
        name: 'useLastHealthModel',
        type: 'boolean',
        default: false,
        description:
          'Whether to reuse the team\'s most recent health-check model. Provide this or "Health Model ID", not both.',
        routing: { send: { type: 'body', property: 'useLastHealthModel' } },
      },
    ],
  },

  // ---- Update ----
  {
    displayName: 'Update Fields',
    name: 'updateFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['update']),
    options: [
      {
        displayName: 'Phase',
        name: 'phase',
        type: 'options',
        default: 'welcome',
        description: 'Move the health check to this working step',
        options: [
          { name: 'Health Discuss', value: 'healthDiscuss' },
          { name: 'Health Survey', value: 'healthSurvey' },
          { name: 'Icebreaker', value: 'icebreaker' },
          { name: 'Open Actions', value: 'openActions' },
          { name: 'Review', value: 'review' },
          { name: 'Welcome', value: 'welcome' },
        ],
        routing: { send: { type: 'body', property: 'phase' } },
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: 'open',
        description: 'Lifecycle status. "Closed" finalises the health check.',
        options: [
          { name: 'Closed', value: 'closed' },
          { name: 'Open', value: 'open' },
        ],
        routing: { send: { type: 'body', property: 'status' } },
      },
    ],
  },
];
