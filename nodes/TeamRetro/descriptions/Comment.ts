import type { INodeProperties } from 'n8n-workflow';
import { deletedTrue } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['comment'], operation } });

export const commentOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['comment'] } },
  default: 'create',
  options: [
    {
      name: 'Create',
      value: 'create',
      action: 'Create comment',
      routing: { request: { method: 'POST', url: '=/v1/comments/{{$parameter.targetType}}/{{$parameter.targetId}}' } },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update comment',
      routing: { request: { method: 'PATCH', url: '=/v1/comments/{{$parameter.commentId}}' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete comment',
      routing: {
        request: { method: 'DELETE', url: '=/v1/comments/{{$parameter.commentId}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
  ],
};

export const commentFields: INodeProperties[] = [
  // ---- targetType (create only) ----
  {
    displayName: 'Target Type',
    name: 'targetType',
    type: 'options',
    required: true,
    default: 'Action',
    placeholder: 'Select target type',
    displayOptions: show(['create']),
    options: [
      { name: 'Action', value: 'Action' },
      { name: 'Agreement', value: 'Agreement' },
      { name: 'Estimation Item', value: 'EstimationItem' },
      { name: 'Group', value: 'Group' },
      { name: 'Idea', value: 'Idea' },
    ],
    description: 'The type of item to comment on',
  },

  // ---- targetId (create only) ----
  {
    displayName: 'Target ID',
    name: 'targetId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['create']),
    description: 'The encoded ID of the target item',
  },

  // ---- commentId (update + delete) ----
  {
    displayName: 'Comment ID',
    name: 'commentId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['update', 'delete']),
    description: 'The 22-character encoded comment ID',
  },

  // ---- text (create + update) ----
  {
    displayName: 'Text',
    name: 'text',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['create', 'update']),
    routing: { send: { type: 'body', property: 'text' } },
    description: 'The comment text',
  },
];
