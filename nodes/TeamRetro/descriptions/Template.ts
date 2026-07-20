import type { INodeProperties } from 'n8n-workflow';
import { paginationFields, offsetPagination, rootPropertyData } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['template'], operation } });

export const templateOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['template'] } },
  default: 'getAll',
  options: [
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many templates',
      routing: {
        request: { method: 'GET', url: '/v1/templates' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get template',
      routing: { request: { method: 'GET', url: '=/v1/templates/{{$parameter.templateId}}' } },
    },
  ],
};

export const templateFields: INodeProperties[] = [
  // ---- ID (get) ---- (plain string; matches Team pattern)
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['get']),
    description: 'The 22-character encoded template ID',
  },
  // ---- Get Many ----
  ...paginationFields('template', 'getAll'),
];
