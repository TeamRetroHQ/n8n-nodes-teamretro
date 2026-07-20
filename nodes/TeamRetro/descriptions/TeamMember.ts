import type { INodeProperties } from 'n8n-workflow';
import { paginationFields, offsetPagination, deletedTrue, rootPropertyData } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['teamMember'], operation } });

export const teamMemberOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['teamMember'] } },
  default: 'getAll',
  options: [
    {
      name: 'Add',
      value: 'add',
      action: 'Add team member',
      routing: {
        request: {
          method: 'PUT',
          url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
        },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get team member',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
        },
      },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many team members',
      routing: {
        request: { method: 'GET', url: '=/v1/teams/{{$parameter.teamId}}/members' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Remove',
      value: 'remove',
      action: 'Remove team member',
      routing: {
        request: {
          method: 'DELETE',
          url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
        },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update team member',
      routing: {
        request: {
          method: 'PATCH',
          url: '=/v1/teams/{{$parameter.teamId}}/members/{{encodeURIComponent($parameter.email)}}',
        },
      },
    },
  ],
};

export const teamMemberFields: INodeProperties[] = [
  // ---- Team ID (all operations) ----
  // Note: plain string; upgrade to a Resource Locator (searchTeams) if picking a team by name matters.
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['add', 'get', 'getAll', 'remove', 'update']),
    description: 'The 22-character encoded team ID',
  },
  // ---- Email (add/get/remove/update, not getAll) ----
  {
    displayName: 'Email',
    name: 'email',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. lucy@teamretro.com',
    displayOptions: show(['add', 'get', 'remove', 'update']),
    description: 'The team member email address',
  },
  // ---- Get Many ----
  ...paginationFields('teamMember', 'getAll'),
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
        displayName: 'Team Admin',
        name: 'teamAdmin',
        type: 'boolean',
        default: false,
        description: 'Whether to make this member a team administrator',
        routing: { send: { type: 'body', property: 'teamAdmin' } },
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
        displayName: 'Team Admin',
        name: 'teamAdmin',
        type: 'boolean',
        default: false,
        description: 'Whether to make this member a team administrator',
        routing: { send: { type: 'body', property: 'teamAdmin' } },
      },
    ],
  },
];
