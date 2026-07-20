import type { INodeProperties } from 'n8n-workflow';
import { paginationFields, offsetPagination, deletedTrue, rootPropertyData } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['agreement'], operation } });

export const agreementOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['agreement'] } },
  default: 'getAll',
  options: [
    {
      name: 'Create',
      value: 'create',
      action: 'Create agreement',
      routing: { request: { method: 'POST', url: '/v1/agreements' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete agreement',
      routing: {
        request: { method: 'DELETE', url: '=/v1/agreements/{{$parameter.agreementId}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get agreement',
      routing: { request: { method: 'GET', url: '=/v1/agreements/{{$parameter.agreementId}}' } },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many agreements',
      routing: {
        request: { method: 'GET', url: '/v1/agreements' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update agreement',
      routing: { request: { method: 'PATCH', url: '=/v1/agreements/{{$parameter.agreementId}}' } },
    },
  ],
};

export const agreementFields: INodeProperties[] = [
  // ---- ID (get/update/delete) ----
  {
    displayName: 'Agreement',
    name: 'agreementId',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    displayOptions: show(['get', 'update', 'delete']),
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchAgreements', searchable: true },
      },
      {
        displayName: 'By ID or URL',
        name: 'id',
        type: 'string',
        extractValue: { type: 'regex', regex: '([a-zA-Z0-9]{22})' },
        placeholder: 'e.g. aB3dE... or https://.../agreements/aB3dE...',
      },
    ],
  },
  // ---- Get Many ----
  ...paginationFields('agreement', 'getAll'),
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: show(['getAll']),
    options: [
      {
        displayName: 'Sort',
        name: 'sort',
        type: 'options',
        default: 'name',
        options: [
          { name: 'Date (Newest)', value: '-date' },
          { name: 'Date (Oldest)', value: 'date' },
          { name: 'Title (A–Z)', value: 'name' },
          { name: 'Title (Z–A)', value: '-name' },
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
  // ---- Create ----
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'team.id' } },
    description: 'The 22-character encoded team ID',
  },
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'title' } },
    description: 'Agreement title or principle text',
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
        displayName: 'Team ID',
        name: 'teamId',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars',
        routing: { send: { type: 'body', property: 'team.id' } },
        description: 'The 22-character encoded team ID',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'title' } },
        description: 'Agreement title or principle text',
      },
    ],
  },
];
