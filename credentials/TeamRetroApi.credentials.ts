import type {
  IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties,
} from 'n8n-workflow';

export class TeamRetroApi implements ICredentialType {
  name = 'teamRetroApi';
  displayName = 'TeamRetro API';
  icon = { light: 'file:TeamRetro.svg', dark: 'file:TeamRetro.dark.svg' } as const;
  documentationUrl = 'https://groupmap.stoplight.io/docs/teamretro/76440f4735887-team-retro-api';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      required: true,
      default: '',
      description: 'A TeamRetro API key (account-scoped or team-scoped)',
    },
    {
      displayName: 'Region',
      name: 'region',
      type: 'options',
      default: 'https://api.teamretro.com',
      description: 'Which TeamRetro API host to send requests to',
      options: [
        { name: 'US', value: 'https://api.teamretro.com' },
        { name: 'EU', value: 'https://api.eu.teamretro.com' },
        { name: 'Custom', value: 'custom' },
      ],
    },
    {
      displayName: 'Custom Base URL',
      name: 'customBaseUrl',
      type: 'string',
      default: '',
      required: true,
      placeholder: 'https://api.teamretro.com',
      description: 'Base URL to send requests to when Region is set to Custom',
      displayOptions: { show: { region: ['custom'] } },
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: { headers: { 'x-api-key': '={{$credentials.apiKey}}' } },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{ $credentials.region === 'custom' ? $credentials.customBaseUrl : $credentials.region }}",
      url: '/v1/teams',
    },
  };
}
