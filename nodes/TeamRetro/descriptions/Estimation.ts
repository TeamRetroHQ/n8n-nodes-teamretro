import type { INodeProperties } from 'n8n-workflow';
import {
  paginationFields,
  offsetPagination,
  deletedTrue,
  rootPropertyData,
  markdownResponse,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['estimation'], operation } });

export const estimationOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['estimation'] } },
  default: 'getAll',
  options: [
    {
      name: 'Add Items',
      value: 'addItems',
      action: 'Add items to estimation',
      routing: {
        request: { method: 'POST', url: '=/v1/estimations/{{$parameter.meetingSlug}}/items' },
      },
    },
    {
      name: 'Create',
      value: 'create',
      action: 'Create estimation',
      routing: { request: { method: 'POST', url: '/v1/estimations' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete estimation',
      routing: {
        request: { method: 'DELETE', url: '=/v1/estimations/{{$parameter.meetingSlug}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get estimation',
      routing: {
        request: { method: 'GET', url: '=/v1/estimations/{{$parameter.meetingSlug}}' },
      },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many estimations',
      routing: {
        request: { method: 'GET', url: '/v1/estimations' },
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
          url: '=/v1/estimations/{{$parameter.meetingSlug}}/report.md',
          ...markdownResponse.request,
        },
        output: markdownResponse.output,
      },
    },
    {
      name: 'Submit Estimate',
      value: 'submitEstimate',
      action: 'Submit estimate for item',
      routing: {
        request: {
          method: 'POST',
          url: '=/v1/estimations/{{$parameter.meetingSlug}}/votes/{{$parameter.estimationItemSlug}}',
        },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update estimation',
      routing: {
        request: { method: 'PATCH', url: '=/v1/estimations/{{$parameter.meetingSlug}}' },
      },
    },
  ],
};

export const estimationFields: INodeProperties[] = [
  // ---- meetingSlug (most ops except getAll + create) ----
  {
    displayName: 'Estimation',
    name: 'meetingSlug',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    displayOptions: show(['addItems', 'delete', 'get', 'getReport', 'submitEstimate', 'update']),
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchEstimations', searchable: true },
      },
      {
        displayName: 'By ID or URL',
        name: 'id',
        type: 'string',
        extractValue: { type: 'regex', regex: '([a-zA-Z0-9]{22})' },
        placeholder: 'e.g. aB3dE... or https://.../estimation/aB3dE...',
      },
    ],
  },

  // ---- Submit Estimate: OAuth-only notice ----
  // This endpoint requires a user OAuth token; TeamRetro API keys are rejected with a 403.
  // Surfaced as a visible notice so it is obvious in the UI before the operation is run.
  {
    displayName:
      'This operation requires a user OAuth token. It is not supported with API-key authentication — TeamRetro rejects API keys for this endpoint with a 403.',
    name: 'submitEstimateNotice',
    type: 'notice',
    default: '',
    displayOptions: show(['submitEstimate']),
  },

  // ---- estimationItemSlug (submitEstimate only) ----
  {
    displayName: 'Estimation Item ID',
    name: 'estimationItemSlug',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['submitEstimate']),
    description: 'The 22-character encoded estimation item ID. Note: this endpoint requires a user OAuth token — TeamRetro API keys are rejected with a 403, so this operation will not work with the standard credential.',
  },

  // ---- Submit Estimate ----
  {
    displayName: 'Estimate Value',
    name: 'estimateValue',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. 5, 8, ?',
    displayOptions: show(['submitEstimate']),
    routing: { send: { type: 'body', property: 'value' } },
    description: 'The estimate card value to record (e.g. "5", "8", or "?"). This operation requires a user token; API keys are rejected.',
  },

  // ---- Get Many ----
  ...paginationFields('estimation', 'getAll'),
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
        description: 'Return estimations on or after this date',
        routing: { send: { type: 'query', property: 'dateFrom' } },
      },
      {
        displayName: 'Date To',
        name: 'dateTo',
        type: 'dateTime',
        default: '',
        description: 'Return estimations on or before this date',
        routing: { send: { type: 'query', property: 'dateTo' } },
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
        // Sent as a raw comma string (the API filter format); matches every other Get Many filter.
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
    description: 'ID of the team to create the estimation in',
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
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'Meeting date. Defaults to today (UTC).',
        routing: { send: { type: 'body', property: 'date' } },
      },
      {
        displayName: 'Deck Name',
        name: 'deckName',
        type: 'string',
        default: '',
        placeholder: 'e.g. Fibonacci',
        description: 'Estimation deck name. Standard decks ("Scrum", "Fibonacci", …) or an org custom deck. Defaults to "Scrum".',
        routing: { send: { type: 'body', property: 'deckName' } },
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'Meeting title. Defaults to "Estimation" when omitted.',
        routing: { send: { type: 'body', property: 'name' } },
      },
    ],
  },

  // ---- Add Items ----
  // Note: fixedCollection matches API items array shape; no abstraction needed
  {
    displayName: 'Items',
    name: 'estimationItems',
    type: 'fixedCollection',
    required: true,
    default: {},
    typeOptions: { multipleValues: true },
    displayOptions: show(['addItems']),
    description: 'Items (tickets/stories) to add to the estimation session. Supports manual items only; linked tracker items (Jira, GitHub, Linear, Azure) are not supported via this node.',
    options: [
      {
        name: 'item',
        displayName: 'Item',
        values: [
          {
            displayName: 'Title',
            name: 'title',
            type: 'string',
            required: true,
            default: '',
            description: 'Item title (e.g. the ticket/story summary)',
          },
          {
            displayName: 'Description',
            name: 'description',
            type: 'string',
            default: '',
            description: 'Optional supporting detail shown with the item',
          },
          {
            displayName: 'Source URL',
            name: 'sourceUrl',
            type: 'string',
            default: '',
            placeholder: 'e.g. https://tracker.example.com/PROJ-123',
            description: 'Optional link back to the source ticket or story',
          },
        ],
      },
    ],
    routing: { send: { type: 'body', property: 'items', value: '={{ $value.item }}' } },
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
        default: 'prepare',
        description: 'Move the estimation to this working step',
        options: [
          { name: 'Estimate', value: 'estimate' },
          { name: 'Icebreaker', value: 'icebreaker' },
          { name: 'Open Actions', value: 'openActions' },
          { name: 'Prepare', value: 'prepare' },
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
        description: 'Lifecycle status. "Closed" finalises the estimation; "open" reopens it.',
        options: [
          { name: 'Closed', value: 'closed' },
          { name: 'Open', value: 'open' },
        ],
        routing: { send: { type: 'body', property: 'status' } },
      },
    ],
  },
];
