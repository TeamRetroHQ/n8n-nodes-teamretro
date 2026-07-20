import type { INodeProperties } from 'n8n-workflow';
import {
  paginationFields,
  offsetPagination,
  deletedTrue,
  rootPropertyData,
  teamIdsFilter,
  teamTagsFilter,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['action'], operation } });

export const actionOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['action'] } },
  default: 'getAll',
  options: [
    {
      name: 'Create',
      value: 'create',
      action: 'Create action',
      routing: { request: { method: 'POST', url: '/v1/actions' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete action',
      routing: {
        request: { method: 'DELETE', url: '=/v1/actions/{{$parameter.actionSlug}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get action',
      routing: { request: { method: 'GET', url: '=/v1/actions/{{$parameter.actionSlug}}' } },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many actions',
      routing: {
        request: { method: 'GET', url: '/v1/actions' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Many (Assigned to Me)',
      value: 'getAllMe',
      action: 'Get many actions assigned to me',
      routing: {
        request: { method: 'GET', url: '/v1/actions/me' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update action',
      routing: { request: { method: 'PATCH', url: '=/v1/actions/{{$parameter.actionSlug}}' } },
    },
  ],
};

export const actionFields: INodeProperties[] = [
  // ---- actionSlug (get/update/delete) ----
  // Note: actionSlug maps to {actionId} in the OpenAPI path param — same 22-char encoded ID pattern
  {
    displayName: 'Action',
    name: 'actionSlug',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    displayOptions: show(['get', 'update', 'delete']),
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchActions', searchable: true },
      },
      {
        displayName: 'By ID or URL',
        name: 'id',
        type: 'string',
        extractValue: { type: 'regex', regex: '([a-zA-Z0-9]{22})' },
        placeholder: 'e.g. aB3dE... or https://.../actions/aB3dE...',
      },
    ],
  },
  // ---- Get Many ----
  ...paginationFields('action', 'getAll'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAll']),
    options: [
      {
        displayName: 'Assigned To',
        name: 'assignedTo',
        type: 'string',
        default: '',
        placeholder: 'e.g. lucy@teamretro.com',
        description: 'Filter actions assigned to the user with this email address',
        routing: { send: { type: 'query', property: 'assignedTo' } },
      },
      {
        displayName: 'Overdue Only',
        name: 'actionOverdue',
        type: 'boolean',
        default: false,
        description: 'Whether to return only actions with a due date in the past',
        routing: { send: { type: 'query', property: 'overdue' } },
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        default: 'name',
        options: [
          { name: 'Date (Newest First)', value: '-date' },
          { name: 'Date (Oldest First)', value: 'date' },
          { name: 'Name (A–Z)', value: 'name' },
          { name: 'Name (Z–A)', value: '-name' },
        ],
        routing: { send: { type: 'query', property: 'sort' } },
      },
      {
        displayName: 'Status',
        name: 'actionStatus',
        type: 'options',
        default: 'accepted',
        options: [
          { name: 'Accepted', value: 'accepted' },
          { name: 'All', value: 'all' },
          { name: 'Proposed', value: 'proposed' },
          { name: 'Rejected', value: 'rejected' },
        ],
        description: 'Filter actions by lifecycle status',
        routing: { send: { type: 'query', property: 'status' } },
      },
      teamIdsFilter,
      teamTagsFilter,
    ],
  },
  // ---- Get Many (Assigned to Me) ----
  ...paginationFields('action', 'getAllMe'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAllMe']),
    options: [
      {
        displayName: 'Overdue Only',
        name: 'actionOverdue',
        type: 'boolean',
        default: false,
        description: 'Whether to return only actions with a due date in the past',
        routing: { send: { type: 'query', property: 'overdue' } },
      },
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        default: 'name',
        options: [
          { name: 'Date (Newest First)', value: '-date' },
          { name: 'Date (Oldest First)', value: 'date' },
          { name: 'Name (A–Z)', value: 'name' },
          { name: 'Name (Z–A)', value: '-name' },
        ],
        routing: { send: { type: 'query', property: 'sort' } },
      },
      {
        displayName: 'Status',
        name: 'actionStatus',
        type: 'options',
        default: 'accepted',
        options: [
          { name: 'Accepted', value: 'accepted' },
          { name: 'All', value: 'all' },
          { name: 'Proposed', value: 'proposed' },
          { name: 'Rejected', value: 'rejected' },
        ],
        description: 'Filter actions by lifecycle status',
        routing: { send: { type: 'query', property: 'status' } },
      },
      teamIdsFilter,
      teamTagsFilter,
    ],
  },
  // ---- Create ----
  // Note: team.id uses dot-path property nesting — n8n serialises 'team.id' to { team: { id: "..." } }
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'team.id' } },
    description: 'The 22-character encoded team ID to associate this action with',
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'title' } },
    description: 'Title of the action item',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['create']),
    options: [
      // Note: assignedTo as fixedCollection matches API shape { email: string }[]
      {
        displayName: 'Assigned To',
        name: 'assignedTo',
        type: 'fixedCollection',
        default: {},
        typeOptions: { multipleValues: true },
        options: [
          {
            name: 'assignee',
            displayName: 'Assignee',
            values: [
              {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                required: true,
                default: '',
                placeholder: 'e.g. lucy@teamretro.com',
              },
            ],
          },
        ],
        routing: { send: { type: 'body', property: 'assignedTo', value: '={{ $value.assignee }}' } },
      },
      {
        displayName: 'Completed',
        name: 'completed',
        type: 'dateTime',
        default: '',
        description: 'Completion date. Set to mark the action done.',
        routing: { send: { type: 'body', property: 'completed' } },
      },
      {
        displayName: 'Due',
        name: 'due',
        type: 'dateTime',
        default: '',
        description: 'Due date for the action. The API expects a date (YYYY-MM-DD); the time component is ignored.',
        routing: { send: { type: 'body', property: 'due' } },
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        default: 'medium',
        options: [
          { name: 'High', value: 'high' },
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
        ],
        description: 'Priority of the action item',
        routing: { send: { type: 'body', property: 'priority' } },
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
        displayName: 'Assigned To',
        name: 'assignedTo',
        type: 'fixedCollection',
        default: {},
        typeOptions: { multipleValues: true },
        options: [
          {
            name: 'assignee',
            displayName: 'Assignee',
            values: [
              {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                required: true,
                default: '',
                placeholder: 'e.g. lucy@teamretro.com',
              },
            ],
          },
        ],
        routing: { send: { type: 'body', property: 'assignedTo', value: '={{ $value.assignee }}' } },
      },
      {
        displayName: 'Completed',
        name: 'completed',
        type: 'dateTime',
        default: '',
        description: 'Completion date. Set to mark the action done, or clear to re-open it.',
        routing: { send: { type: 'body', property: 'completed' } },
      },
      {
        displayName: 'Due',
        name: 'due',
        type: 'dateTime',
        default: '',
        description: 'Due date for the action. The API expects a date (YYYY-MM-DD); the time component is ignored.',
        routing: { send: { type: 'body', property: 'due' } },
      },
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        default: 'medium',
        options: [
          { name: 'High', value: 'high' },
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
        ],
        routing: { send: { type: 'body', property: 'priority' } },
      },
      {
        displayName: 'Team ID',
        name: 'teamId',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...',
        description: 'Move this action to a different team',
        routing: { send: { type: 'body', property: 'team.id' } },
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'title' } },
      },
    ],
  },
];
