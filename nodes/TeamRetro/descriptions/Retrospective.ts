import type { INodeProperties } from 'n8n-workflow';
import {
  paginationFields,
  offsetPagination,
  deletedTrue,
  rootPropertyData,
  markdownResponse,
} from './shared';

const show = (operation: string[]) => ({ show: { resource: ['retrospective'], operation } });

export const retrospectiveOperations: INodeProperties = {
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  noDataExpression: true,
  displayOptions: { show: { resource: ['retrospective'] } },
  default: 'getAll',
  options: [
    {
      name: 'Capture Idea',
      value: 'captureIdea',
      action: 'Capture idea',
      routing: {
        request: { method: 'POST', url: '=/v1/teams/{{$parameter.teamId}}/captured-ideas' },
      },
    },
    {
      name: 'Create',
      value: 'create',
      action: 'Create retrospective',
      routing: { request: { method: 'POST', url: '/v1/retrospectives' } },
    },
    {
      name: 'Delete',
      value: 'delete',
      action: 'Delete retrospective',
      routing: {
        request: { method: 'DELETE', url: '=/v1/retrospectives/{{$parameter.meetingSlug}}' },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Delete Idea',
      value: 'deleteIdea',
      action: 'Delete idea',
      routing: {
        request: {
          method: 'DELETE',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/ideas/{{$parameter.ideaSlug}}',
        },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Get',
      value: 'get',
      action: 'Get retrospective',
      routing: {
        request: { method: 'GET', url: '=/v1/retrospectives/{{$parameter.meetingSlug}}' },
      },
    },
    {
      name: 'Get Many',
      value: 'getAll',
      action: 'Get many retrospectives',
      routing: {
        request: { method: 'GET', url: '/v1/retrospectives' },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Many Groups',
      value: 'getAllGroups',
      action: 'Get many groups',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/groups',
        },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Many Ideas',
      value: 'getAllIdeas',
      action: 'Get many ideas',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/ideas',
        },
        operations: { pagination: offsetPagination },
        output: { postReceive: [rootPropertyData] },
      },
    },
    {
      name: 'Get Report (Markdown)',
      value: 'getReport',
      action: 'Get report as markdown',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/report.md',
          ...markdownResponse.request,
        },
        output: markdownResponse.output,
      },
    },
    {
      name: 'Get Summary (Markdown)',
      value: 'getSummary',
      action: 'Get summary as markdown',
      routing: {
        request: {
          method: 'GET',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/summary.md',
          ...markdownResponse.request,
        },
        output: markdownResponse.output,
      },
    },
    {
      name: 'Remove Vote',
      value: 'removeVote',
      action: 'Remove vote',
      routing: {
        request: {
          method: 'DELETE',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/votes/{{$parameter.targetSlug}}',
        },
        output: { postReceive: [deletedTrue] },
      },
    },
    {
      name: 'Update',
      value: 'update',
      action: 'Update retrospective',
      routing: {
        request: { method: 'PATCH', url: '=/v1/retrospectives/{{$parameter.meetingSlug}}' },
      },
    },
    {
      name: 'Update Idea',
      value: 'updateIdea',
      action: 'Update idea',
      routing: {
        request: {
          method: 'PATCH',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/ideas/{{$parameter.ideaSlug}}',
        },
      },
    },
    {
      name: 'Vote',
      value: 'vote',
      action: 'Vote on idea or group',
      routing: {
        request: {
          method: 'POST',
          url: '=/v1/retrospectives/{{$parameter.meetingSlug}}/votes/{{$parameter.targetSlug}}',
        },
      },
    },
  ],
};

export const retrospectiveFields: INodeProperties[] = [
  // ---- meetingSlug (most ops) ----
  {
    displayName: 'Retrospective',
    name: 'meetingSlug',
    type: 'resourceLocator',
    required: true,
    default: { mode: 'list', value: '' },
    displayOptions: show([
      'delete',
      'deleteIdea',
      'get',
      'getAllGroups',
      'getAllIdeas',
      'getReport',
      'getSummary',
      'removeVote',
      'update',
      'updateIdea',
      'vote',
    ]),
    modes: [
      {
        displayName: 'From List',
        name: 'list',
        type: 'list',
        typeOptions: { searchListMethod: 'searchRetrospectives', searchable: true },
      },
      {
        displayName: 'By ID or URL',
        name: 'id',
        type: 'string',
        extractValue: { type: 'regex', regex: '([a-zA-Z0-9]{22})' },
        placeholder: 'e.g. aB3dE... or https://.../retrospective/aB3dE...',
      },
    ],
  },

  // ---- ideaSlug (idea ops) ----
  {
    displayName: 'Idea ID',
    name: 'ideaSlug',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['deleteIdea', 'updateIdea']),
    description: 'The 22-character encoded idea ID',
  },

  // ---- targetSlug (vote ops) ----
  {
    displayName: 'Target ID',
    name: 'targetSlug',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['removeVote', 'vote']),
    description: 'The 22-character encoded idea or group ID to vote on',
  },

  // ---- teamId (create) ----
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'teamId' } },
    description: 'ID of the team that owns the retrospective',
  },

  // ---- teamId (captureIdea) ----
  {
    displayName: 'Team ID',
    name: 'teamId',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'e.g. aB3dE...22chars',
    displayOptions: show(['captureIdea']),
    description: 'ID of the team to capture the idea under',
  },

  // ---- Get Many ----
  ...paginationFields('retrospective', 'getAll'),

  // ---- Get Many Ideas ----
  ...paginationFields('retrospective', 'getAllIdeas'),

  // ---- Get Many Groups ----
  ...paginationFields('retrospective', 'getAllGroups'),

  // ---- Create ----
  {
    displayName: 'Name',
    name: 'name',
    type: 'string',
    default: '',
    displayOptions: show(['create']),
    routing: { send: { type: 'body', property: 'name' } },
    description: 'Meeting title. Defaults to "Retrospective" when omitted.',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['create']),
    options: [
      {
        displayName: 'Anonymity',
        name: 'anonymity',
        type: 'options',
        default: 'off',
        description: 'Anonymity mode for the retrospective',
        options: [
          { name: 'Aliases', value: 'aliases' },
          { name: 'Full', value: 'full' },
          { name: 'Off', value: 'off' },
        ],
        routing: { send: { type: 'body', property: 'anonymity' } },
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'Meeting date. Defaults to today (UTC).',
        routing: { send: { type: 'body', property: 'date' } },
      },
      {
        displayName: 'Template ID',
        name: 'templateId',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars',
        description:
          'Encoded ID of a template to use. Takes precedence over topics when supplied.',
        routing: { send: { type: 'body', property: 'templateId' } },
      },
      {
        displayName: 'Topics',
        name: 'topics',
        type: 'fixedCollection',
        default: {},
        typeOptions: { multipleValues: true },
        description: 'Custom topics (columns) to seed the retrospective with, in display order',
        options: [
          {
            name: 'topic',
            displayName: 'Topic',
            values: [
              {
                displayName: 'Title',
                name: 'title',
                type: 'string',
                required: true,
                default: '',
                description: 'Topic (column) heading',
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Optional supporting prompt shown under the heading',
              },
            ],
          },
        ],
        routing: { send: { type: 'body', property: 'topics', value: '={{ $value.topic }}' } },
      },
      {
        displayName: 'Use Last Template',
        name: 'useLastTemplate',
        type: 'boolean',
        default: false,
        description:
          "Whether to reuse the team's most recent retrospective template when no templateId is supplied",
        routing: { send: { type: 'body', property: 'useLastTemplate' } },
      },
    ],
  },

  // ---- Capture Idea ----
  {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['captureIdea']),
    routing: { send: { type: 'body', property: 'title' } },
    description: 'Text of the idea to capture',
  },
  {
    displayName: 'Additional Fields',
    name: 'captureIdeaAdditionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['captureIdea']),
    options: [
      {
        displayName: 'Retrospective ID',
        name: 'retrospectiveId',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars',
        description:
          'Target a specific open retrospective when the team has more than one open at the same time',
        routing: { send: { type: 'body', property: 'retrospectiveId' } },
      },
      {
        displayName: 'Topic ID',
        name: 'topicId',
        type: 'string',
        default: '',
        placeholder: 'e.g. aB3dE...22chars',
        description: 'Place the idea in a specific column. Defaults to the first column when omitted.',
        routing: { send: { type: 'body', property: 'topicId' } },
      },
    ],
  },

  // ---- Vote ----
  {
    displayName: 'Additional Fields',
    name: 'voteAdditionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: show(['vote']),
    options: [
      {
        displayName: 'Weight',
        name: 'weight',
        type: 'number',
        default: 1,
        description: 'Number of votes to add (1–256). Defaults to 1.',
        typeOptions: { minValue: 1, maxValue: 256 },
        routing: { send: { type: 'body', property: 'weight' } },
      },
    ],
  },

  // ---- Update Idea ----
  {
    displayName: 'Title',
    name: 'ideaTitle',
    type: 'string',
    required: true,
    default: '',
    displayOptions: show(['updateIdea']),
    routing: { send: { type: 'body', property: 'title' } },
    description: 'New text for the idea card',
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
        displayName: 'Anonymity',
        name: 'anonymity',
        type: 'options',
        default: 'off',
        description:
          'Anonymity mode. Can only be increased (off → aliases → full); reducing it is rejected.',
        options: [
          { name: 'Aliases', value: 'aliases' },
          { name: 'Full', value: 'full' },
          { name: 'Off', value: 'off' },
        ],
        routing: { send: { type: 'body', property: 'anonymity' } },
      },
      {
        displayName: 'Date',
        name: 'date',
        type: 'dateTime',
        default: '',
        description: 'New meeting date',
        routing: { send: { type: 'body', property: 'date' } },
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'New meeting description, shown under the title',
        routing: { send: { type: 'body', property: 'description' } },
      },
      {
        displayName: 'Name',
        name: 'name',
        type: 'string',
        default: '',
        description: 'New meeting title',
        routing: { send: { type: 'body', property: 'name' } },
      },
      {
        displayName: 'Phase',
        name: 'phase',
        type: 'options',
        default: 'brainstorm',
        description: 'Move the retrospective to this working step',
        options: [
          { name: 'Brainstorm', value: 'brainstorm' },
          { name: 'Discuss', value: 'discuss' },
          { name: 'Group', value: 'group' },
          { name: 'Icebreaker', value: 'icebreaker' },
          { name: 'Open Actions', value: 'openActions' },
          { name: 'Review', value: 'review' },
          { name: 'Vote', value: 'vote' },
          { name: 'Welcome', value: 'welcome' },
        ],
        routing: { send: { type: 'body', property: 'phase' } },
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: 'open',
        description: 'Lifecycle status. "Closed" finalises the retrospective.',
        options: [
          { name: 'Closed', value: 'closed' },
          { name: 'Open', value: 'open' },
        ],
        routing: { send: { type: 'body', property: 'status' } },
      },
      {
        displayName: 'Topics',
        name: 'topics',
        type: 'fixedCollection',
        default: {},
        typeOptions: { multipleValues: true },
        description:
          'Full replacement of the retrospective columns. Items with ID update that column; items without ID create one.',
        options: [
          {
            name: 'topic',
            displayName: 'Topic',
            values: [
              {
                displayName: 'Title',
                name: 'title',
                type: 'string',
                required: true,
                default: '',
                description: 'Topic (column) heading',
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
                description: 'Optional supporting prompt shown under the heading',
              },
              {
                displayName: 'Topic ID',
                name: 'id',
                type: 'string',
                default: '',
                placeholder: 'e.g. aB3dE...22chars',
                description: 'ID of an existing topic to update. Omit to create a new topic.',
              },
            ],
          },
        ],
        routing: { send: { type: 'body', property: 'topics', value: '={{ $value.topic }}' } },
      },
    ],
  },
];
