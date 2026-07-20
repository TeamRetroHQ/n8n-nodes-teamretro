import type { INodeProperties } from 'n8n-workflow';

export const returnAll: INodeProperties = {
  displayName: 'Return All',
  name: 'returnAll',
  type: 'boolean',
  default: false,
  description: 'Whether to return all results or only up to a given limit',
};

export const limit: INodeProperties = {
  displayName: 'Limit',
  name: 'limit',
  type: 'number',
  typeOptions: { minValue: 1 },
  default: 50,
  description: 'Max number of results to return',
  displayOptions: { show: { returnAll: [false] } },
  routing: { send: { type: 'query', property: 'limit' } },
};

// Standard Get Many pagination controls: a Return All toggle plus a Limit shown only when
// Return All is off. Every list operation repeats this exact pair scoped to its resource/operation,
// so build it once here. (Report's team-reports list and Search override the limit shape and keep
// their own blocks.)
export function paginationFields(resource: string, operation: string): INodeProperties[] {
  return [
    { ...returnAll, displayOptions: { show: { resource: [resource], operation: [operation] } } },
    {
      ...limit,
      displayOptions: { show: { resource: [resource], operation: [operation], returnAll: [false] } },
    },
  ];
}

// Comma-separated string → trimmed, non-empty array. Used by routing.send.value for fields whose
// API param expects a JSON array (e.g. Search teamIds/teamTags, Team tags). Query-string filters
// that expect a raw comma string (most Get Many filters) do NOT use this.
export const csvToArray =
  '={{ $value ? $value.split(",").map((s) => s.trim()).filter(Boolean) : undefined }}';

// Common Get Many filter fields, sent as raw comma query strings (the API's filter format).
// Re-used across resources that expose the same team/date filters. Fields whose param instead
// expects a JSON array keep their own declaration with csvToArray routing.
export const teamIdsFilter: INodeProperties = {
  displayName: 'Team IDs',
  name: 'teamIds',
  type: 'string',
  default: '',
  description: 'Comma-separated team IDs to filter by',
  routing: { send: { type: 'query', property: 'teamIds' } },
};

export const teamTagsFilter: INodeProperties = {
  displayName: 'Team Tags',
  name: 'teamTags',
  type: 'string',
  default: '',
  description: 'Comma-separated team tags to filter by',
  routing: { send: { type: 'query', property: 'teamTags' } },
};

export const dateFromFilter: INodeProperties = {
  displayName: 'Date From',
  name: 'dateFrom',
  type: 'dateTime',
  default: '',
  description: 'Earliest date to include (inclusive), e.g. 2026-01-01',
  routing: { send: { type: 'query', property: 'dateFrom' } },
};

export const dateToFilter: INodeProperties = {
  displayName: 'Date To',
  name: 'dateTo',
  type: 'dateTime',
  default: '',
  description: 'Latest date to include (inclusive), e.g. 2026-12-31',
  routing: { send: { type: 'query', property: 'dateTo' } },
};

// Offset pagination for the standard list envelope.
export const offsetPagination = {
  type: 'offset' as const,
  properties: {
    limitParameter: 'limit',
    offsetParameter: 'offset',
    pageSize: 50,
    rootProperty: 'data',
    type: 'query' as const,
  },
};

// Extract the standard list envelope's data array. Reused by every Get Many op.
export const rootPropertyData = {
  type: 'rootProperty' as const,
  properties: { property: 'data' as const },
};

// Map a 2xx delete to { deleted: true } (n8n convention).
export const deletedTrue = {
  type: 'set' as const,
  properties: { value: '={{ { "deleted": true } }}' },
};

// Handle text/markdown endpoints (report.md / summary.md): request text/markdown, wrap the raw
// body as a single { markdown } field.
export const markdownResponse = {
  request: { headers: { Accept: 'text/markdown' }, json: false as const },
  output: {
    postReceive: [
      { type: 'set' as const, properties: { value: '={{ { "markdown": $response.body } }}' } },
    ],
  },
};
