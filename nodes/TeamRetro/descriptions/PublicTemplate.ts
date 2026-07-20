import type { INodeProperties } from 'n8n-workflow';

const show = (operation: string[]) => ({ show: { resource: ['publicTemplate'], operation } });

export const publicTemplateOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['publicTemplate'] } },
  default: 'getAll',
  options: [
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many public templates',
      routing: { request: { method: 'GET', url: '/v1/public-templates' } },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get public template',
      routing: { request: { method: 'GET', url: '=/v1/public-templates/{{$parameter.templateGroupId}}' } },
    },
  ],
};

export const publicTemplateFields: INodeProperties[] = [
  // ---- ID (get) ---- (plain string; read-only, no pagination for Get)
  {
    displayName: 'Template Group ID',
    name: 'templateGroupId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. mad-sad-glad',
    displayOptions: show(['get']),
    description: 'The template group identifier',
  },
];
