import type { INodeProperties } from 'n8n-workflow';
import {
  paginationFields,
  offsetPagination,
  deletedTrue,
  rootPropertyData,
  teamIdsFilter,
  teamTagsFilter,
  csvToArray,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['team'], operation } });

export const teamOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['team'] } },
  default: 'getAll',
  options: [
    {
      name: 'Create',
      value: 'create',
      action: 'Create team',
      routing: { request: { method: 'POST', url: '/v1/teams' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete team',
      routing: {
        request: { method: 'DELETE', url: '=/v1/teams/{{$parameter.teamId}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get team',
      routing: { request: { method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}' } },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many teams',
      routing: {
        request: { method: 'GET', url: '/v1/teams' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update team',
      routing: { request: { method: 'PATCH', url: '=/v1/teams/{{$parameter.teamId}}' } },
    },
  ],
};

export const teamFields: INodeProperties[] = [
  // ---- ID (get/update/delete) ----
  {
    displayName: 'Team',
    name: 'teamId',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    displayOptions: show(['get', 'update', 'delete']),
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchTeams', searchable: true },
      },
      {
        displayName: 'By ID or URL',
        name: 'id',
        type: 'string',
        extractValue: { type: 'regex', regex: '([a-zA-Z0-9]{22})' },
        placeholder: 'e.g. aB3dE... or https://.../teams/aB3dE...',
      },
    ],
  },
  // ---- Get Many ----
  ...paginationFields('team', 'getAll'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAll']),
    options: [
      teamIdsFilter,
      teamTagsFilter,
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        default: 'name',
        options: [
          { name: 'Name (A–Z)', value: 'name' },
          { name: 'Name (Z–A)', value: '-name' },
        ],
        routing: { send: { type: 'query', property: 'sort' } },
      },
    ],
  },
  // ---- Create ----
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'name' } },
    description: 'Name of the team',
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
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Comma-separated tags for filtering reports',
        routing: { send: { type: 'body', property: 'tags', value: csvToArray } },
      },
      // Note: members as fixedCollection matches API shape; no abstraction needed
      {
        displayName: 'Members',
        name: 'members',
        type: 'fixedCollection',
        default: {},
        typeOptions: { multipleValues: true },
        options: [
          {
            name: 'member',
            displayName: 'Member',
            values: [
              { displayName: 'Email', name: 'email', type: 'string', required: true, default: '', placeholder: 'e.g. lucy@teamretro.com' },
              { displayName: 'Name', name: 'name', type: 'string', default: '' },
              { displayName: 'Team Admin', name: 'teamAdmin', type: 'boolean', default: false },
            ],
          },
        ],
        routing: { send: { type: 'body', property: 'members', value: '={{ $value.member }}' } },
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
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'name' } },
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'tags', value: csvToArray } },
      },
    ],
  },
];
