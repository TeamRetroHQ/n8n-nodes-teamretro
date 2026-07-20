import type { INodeProperties } from 'n8n-workflow';
import { paginationFields, offsetPagination, deletedTrue, rootPropertyData } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['user'], operation } });

export const userOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['user'] } },
  default: 'getAll',
  options: [
    {
      name: 'Add',
      value: 'add',
      action: 'Add user',
      routing: {
        request: {
          method: 'PUT',
          url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
        },
      },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete user',
      routing: {
        request: {
          method: 'DELETE',
          url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
        },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get user',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
        },
      },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many users',
      routing: {
        request: { method: 'GET', url: '/v1/users' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update user',
      routing: {
        request: {
          method: 'PATCH',
          url: '=/v1/users/{{encodeURIComponent($parameter.email)}}',
        },
      },
    },
  ],
};

export const userFields: INodeProperties[] = [
  // ---- Email (add/get/update/delete, not getAll) ----
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. lucy@teamretro.com',
    displayOptions: show(['add', 'delete', 'get', 'update']),
    description:
      'The user email address. Requires an account-scoped API key; team-scoped keys are rejected with a 403.',
  },
  // ---- Get Many ----
  ...paginationFields('user', 'getAll'),
  // ---- Add ----
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['add']),
    options: [
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        routing: { send: { type: 'body', property: 'name' } },
      },
      {
        displayName: 'Organization Admin',
        name: 'organizationAdmin',
        type: 'boolean',
        default: false,
        description: 'Whether to grant the organization-admin role to this user',
        routing: { send: { type: 'body', property: 'organizationAdmin' } },
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the user is active in the account',
        routing: { send: { type: 'body', property: 'active' } },
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
        displayName: 'Organization Admin',
        name: 'organizationAdmin',
        type: 'boolean',
        default: false,
        description: 'Whether to grant the organization-admin role to this user',
        routing: { send: { type: 'body', property: 'organizationAdmin' } },
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the user is active in the account',
        routing: { send: { type: 'body', property: 'active' } },
      },
    ],
  },
];
