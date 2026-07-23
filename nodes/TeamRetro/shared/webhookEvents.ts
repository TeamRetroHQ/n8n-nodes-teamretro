import type { INodePropertyOptions } from 'n8n-workflow';

// The user-facing TeamRetro webhook events. Authoritative registry =
// apps/server/config/notifications.yaml (channel: webhook, preferenceLevels: ["integration"]),
// which resolves to 24. The 5 integration-plumbing events — action.published, action.publishFailed,
// integration.error, integration.token.expiring, integration.disabled — are intentionally excluded:
// they report on the integration/webhook machinery, not retro activity a workflow would act on.
// That leaves these 19. Shared with the future auto-register create() so the exposed set and the
// subscribed set stay in sync. Options are alphabetized by name (n8n-nodes-base lint rule).
export const webhookEventOptions: INodePropertyOptions[] = [
  { name: 'Action Assignee Changed', value: 'action.assignee.changed' },
  { name: 'Action Completed', value: 'action.completed' },
  { name: 'Action Created', value: 'action.created' },
  { name: 'Action Deleted', value: 'action.deleted' },
  { name: 'Action Due Date Changed', value: 'action.dueDate.changed' },
  { name: 'Action Updated', value: 'action.updated' },
  { name: 'Agreement Created', value: 'agreement.created' },
  { name: 'Agreement Deleted', value: 'agreement.deleted' },
  { name: 'Agreement Updated', value: 'agreement.updated' },
  { name: 'Estimation Completed', value: 'estimation.completed' },
  { name: 'Estimation Created', value: 'estimation.created' },
  { name: 'Health Check Completed', value: 'healthCheck.completed' },
  { name: 'Health Check Created', value: 'healthCheck.created' },
  { name: 'Kudos Created', value: 'kudos.created' },
  { name: 'Mention Created', value: 'mention.created' },
  { name: 'Retrospective Completed', value: 'retrospective.completed' },
  { name: 'Retrospective Created', value: 'retrospective.created' },
  { name: 'Team Member Deleted', value: 'team.member.deleted' },
  { name: 'Team Member Invited', value: 'team.member.invited' },
];

export const webhookEventValues: string[] = webhookEventOptions.map((o) => o.value as string);
