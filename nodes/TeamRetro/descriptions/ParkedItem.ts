import type { INodeProperties } from 'n8n-workflow';
import { paginationFields, offsetPagination, deletedTrue, rootPropertyData } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['parkedItem'], operation } });

export const parkedItemOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['parkedItem'] } },
  default: 'getAll',
  options: [
    {
      name: 'Create',
      value: 'create',
      action: 'Create parked item',
      routing: { request: { method: 'POST', url: '=/v1/teams/{{$parameter.teamId}}/parked-items' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete parked item',
      routing: {
        request: { method: 'DELETE', url: '=/v1/teams/{{$parameter.teamId}}/parked-items/{{$parameter.parkedItemSlug}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get parked item',
      routing: { request: { method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}/parked-items/{{$parameter.parkedItemSlug}}' } },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many parked items',
      routing: {
        request: { method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}/parked-items' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update parked item',
      routing: { request: { method: 'PATCH', url: '=/v1/teams/{{$parameter.teamId}}/parked-items/{{$parameter.parkedItemSlug}}' } },
    },
  ],
};

export const parkedItemFields: INodeProperties[] = [
  // ---- Team ID (all operations) ----
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['create', 'delete', 'get', 'getAll', 'update']),
    description: 'The 22-character encoded team ID',
    // Note: plain string; upgrade to a Resource Locator (searchTeams) if picking a team by name matters.
  },
  // ---- Parked Item Slug (get/update/delete) ----
  {
    displayName: 'Parked Item ID',
    name: 'parkedItemSlug',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['delete', 'get', 'update']),
  },
  // ---- Get Many ----
  ...paginationFields('parkedItem', 'getAll'),
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
        type: 'string',
        default: '',
        description: 'Earliest creation date (inclusive). ISO-8601 date format.',
        routing: { send: { type: 'query', property: 'dateFrom' } },
      },
      {
        displayName: 'Date To',
        name: 'dateTo',
        type: 'string',
        default: '',
        description: 'Latest creation date (inclusive). ISO-8601 date format. Use to find stale items lingering in the parking lot.',
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
    ],
  },
  // ---- Create ----
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'title' } },
    description: 'The parked item title. A 403 response means the account does not have the parking lot plan feature enabled.',
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
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'title' } },
      },
    ],
  },
];
