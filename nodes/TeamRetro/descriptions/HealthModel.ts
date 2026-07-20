import type { INodeProperties } from 'n8n-workflow';
import { paginationFields, offsetPagination, rootPropertyData } from './shared';

const show = (operation: string[]) => ({ show: { resource: ['healthModel'], operation } });

export const healthModelOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['healthModel'] } },
  default: 'getAll',
  options: [
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many health models',
      routing: {
        request: { method: 'GET', url: '/v1/health-models' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get health model',
      routing: { request: { method: 'GET', url: '=/v1/health-models/{{$parameter.healthModelId}}' } },
    },
  ],
};

export const healthModelFields: INodeProperties[] = [
  // ---- ID (get) ---- (plain string; matches Team pattern)
  {
    displayName: 'Health Model ID',
    name: 'healthModelId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. spotify-squad-health',
    displayOptions: show(['get']),
    description: 'The ID of the health model',
  },
  // ---- Get Many ----
  ...paginationFields('healthModel', 'getAll'),
];
