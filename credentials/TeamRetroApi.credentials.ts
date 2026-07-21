import type {
  IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties,
} from 'n8n-workflow';

export class TeamRetroApi implements ICredentialType {
  name = 'teamRetroApi';
  displayName = 'TeamRetro API';
  icon = { light: 'file:TeamRetro.svg', dark: 'file:TeamRetro.dark.svg' } as const;
  documentationUrl = 'https://developer.teamretro.com/docs/api';

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
      ],
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: { headers: { 'x-api-key': '={{$credentials.apiKey}}' } },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{ $credentials.region }}',
      url: '/v1/teams',
    },
  };
}
