import type {
  ILoadOptionsFunctions,
  INodeListSearchItems,
  INodeListSearchResult,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { actionOperations, actionFields } from './descriptions/Action';
import { agreementOperations, agreementFields } from './descriptions/Agreement';
import { commentOperations, commentFields } from './descriptions/Comment';
import { estimationOperations, estimationFields } from './descriptions/Estimation';
import { healthCheckOperations, healthCheckFields } from './descriptions/HealthCheck';
import { healthModelOperations, healthModelFields } from './descriptions/HealthModel';
import { parkedItemOperations, parkedItemFields } from './descriptions/ParkedItem';
import { publicTemplateOperations, publicTemplateFields } from './descriptions/PublicTemplate';
import { teamOperations, teamFields } from './descriptions/Team';
import { teamMemberOperations, teamMemberFields } from './descriptions/TeamMember';
import { templateOperations, templateFields } from './descriptions/Template';
import { insightOperations, insightFields } from './descriptions/Insight';
import { reportOperations, reportFields } from './descriptions/Report';
import { retrospectiveOperations, retrospectiveFields } from './descriptions/Retrospective';
import { searchOperations, searchFields } from './descriptions/Search';
import { userOperations, userFields } from './descriptions/User';

// Resource Locator "From List" backing. All 6 list endpoints share one shape:
// { data: [ { id, name|title, url } ] }. The value is always `id` (matches the
// GET /{resource}/{id} path param); display is name (Team) or title (the rest).
// Note: our Get Many endpoints have no name query param, so the `filter`
// is applied client-side; upgrade to a server-side search param if lists grow large.
async function searchResource(
  this: ILoadOptionsFunctions,
  url: string,
  nameKey: 'name' | 'title',
  filter?: string,
): Promise<INodeListSearchResult> {
  const creds = await this.getCredentials('teamRetroApi');
  const baseURL = (creds.region === 'custom' ? creds.customBaseUrl : creds.region) as string;
  const res = (await this.helpers.httpRequestWithAuthentication.call(this, 'teamRetroApi', {
    method: 'GET',
    baseURL,
    url,
  })) as { data?: Array<Record<string, unknown>> };

  const needle = filter?.toLowerCase();
  const results: INodeListSearchItems[] = (res.data ?? [])
    .map((item) => {
      const value = String(item.id ?? '');
      const name = (item[nameKey] as string | null) || value;
      const itemUrl = typeof item.url === 'string' ? item.url : undefined;
      return { name, value, ...(itemUrl ? { url: itemUrl } : {}) };
    })
    .filter((r) => (needle ? r.name.toLowerCase().includes(needle) : true));

  return { results };
}

export async function searchTeams(this: ILoadOptionsFunctions, filter?: string) {
  return searchResource.call(this, '/v1/teams', 'name', filter);
}
export async function searchRetrospectives(this: ILoadOptionsFunctions, filter?: string) {
  return searchResource.call(this, '/v1/retrospectives', 'title', filter);
}
export async function searchActions(this: ILoadOptionsFunctions, filter?: string) {
  return searchResource.call(this, '/v1/actions', 'title', filter);
}
export async function searchHealthChecks(this: ILoadOptionsFunctions, filter?: string) {
  return searchResource.call(this, '/v1/health-checks', 'title', filter);
}
export async function searchEstimations(this: ILoadOptionsFunctions, filter?: string) {
  return searchResource.call(this, '/v1/estimations', 'title', filter);
}
export async function searchAgreements(this: ILoadOptionsFunctions, filter?: string) {
  return searchResource.call(this, '/v1/agreements', 'title', filter);
}

export class TeamRetro implements INodeType {
  methods = {
    listSearch: {
      searchTeams,
      searchRetrospectives,
      searchActions,
      searchHealthChecks,
      searchEstimations,
      searchAgreements,
    },
  };

  description: INodeTypeDescription = {
    displayName: 'TeamRetro',
    name: 'teamRetro',
    icon: { light: 'file:TeamRetro.svg', dark: 'file:TeamRetro.dark.svg' },
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with the TeamRetro public API',
    usableAsTool: true,
    defaults: { name: 'TeamRetro' },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'teamRetroApi', required: true }],
    requestDefaults: {
      baseURL: "={{ $credentials.region === 'custom' ? $credentials.customBaseUrl : $credentials.region }}",
      headers: { 'Content-Type': 'application/json' },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        default: 'team',
        options: [
          { name: 'Action', value: 'action' },
          { name: 'Agreement', value: 'agreement' },
          { name: 'Comment', value: 'comment' },
          { name: 'Estimation', value: 'estimation' },
          { name: 'Health Check', value: 'healthCheck' },
          { name: 'Health Model', value: 'healthModel' },
          { name: 'Insight', value: 'insight' },
          { name: 'Parked Item', value: 'parkedItem' },
          { name: 'Public Template', value: 'publicTemplate' },
          { name: 'Report', value: 'report' },
          { name: 'Retrospective', value: 'retrospective' },
          { name: 'Search', value: 'search' },
          { name: 'Team', value: 'team' },
          { name: 'Team Member', value: 'teamMember' },
          { name: 'Template', value: 'template' },
          { name: 'User', value: 'user' },
        ],
      },
      actionOperations,
      ...actionFields,
      agreementOperations,
      ...agreementFields,
      commentOperations,
      ...commentFields,
      estimationOperations,
      ...estimationFields,
      healthCheckOperations,
      ...healthCheckFields,
      healthModelOperations,
      ...healthModelFields,
      insightOperations,
      ...insightFields,
      parkedItemOperations,
      ...parkedItemFields,
      publicTemplateOperations,
      ...publicTemplateFields,
      reportOperations,
      ...reportFields,
      searchOperations,
      ...searchFields,
      teamOperations,
      ...teamFields,
      teamMemberOperations,
      ...teamMemberFields,
      templateOperations,
      ...templateFields,
      retrospectiveOperations,
      ...retrospectiveFields,
      userOperations,
      ...userFields,
    ],
  };
}
