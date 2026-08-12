# Example workflows

Importable n8n workflows for the TeamRetro node. Each one is small on purpose — take it,
swap the destination for whatever your team already uses, and delete the rest.

## How to import

In n8n: **Workflows → Add workflow → ⋯ (top right) → Import from File**, pick the `.json`,
then open the sticky note on the canvas and follow the setup steps.

Every example uses the published node type `n8n-nodes-teamretro.*`. If you installed a scoped
build instead, find-and-replace `n8n-nodes-teamretro.` with `@your-scope/n8n-nodes-teamretro.`
in the file before importing.

## The examples

| # | Workflow | Starts with | API key needed |
|---|---|---|---|
| 1 | [Retro completed → Slack digest](./01-retro-completed-slack-digest.json) | TeamRetro Trigger — `retrospective.completed` | team or account |
| 2 | [High-priority action → Slack alert](./02-high-priority-action-alert.json) | TeamRetro Trigger — `action.created` | none |
| 3 | [Kudos → Slack shout-out](./03-kudos-to-slack.json) | TeamRetro Trigger — `kudos.created` | none |
| 4 | [Weekly overdue actions digest](./04-weekly-overdue-actions-digest.json) | Schedule Trigger | team or account |
| 5 | [Auto-create the sprint retrospective](./05-schedule-sprint-retrospective.json) | Schedule Trigger | team or account |
| 6 | [Health check completed → email summary](./06-healthcheck-completed-email-summary.json) | TeamRetro Trigger — `healthCheck.completed` | team or account |
| 7 | [Onboard a user onto a team](./07-onboard-user-to-team.json) | n8n Form | **account only** (`tra_`) |
| 8 | [AI agent retro assistant](./08-ai-agent-retro-assistant.json) | Chat Trigger → AI Agent | team or account |
| 9 | [Health check scores → Google Sheets](./09-healthcheck-scores-to-google-sheets.json) | TeamRetro Trigger — `healthCheck.completed` | team or account |
| 10 | [Meeting transcript → pre-seeded retro](./10-transcript-to-preseeded-retro.json) | Webhook from your transcript tool | team or account |
| 11 | [Incident resolved → postmortem retro](./11-incident-to-postmortem-retro.json) | Webhook from PagerDuty / Sentry | team or account |

Examples 2 and 3 need no API key at all — the webhook payload already carries the data,
so nothing calls back to the API.

Example 8 needs two extra things: a chat model attached to the agent (any provider), and —
on self-hosted n8n — the instance started with `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`,
without which community nodes are never offered as agent tools. See
[Using TeamRetro as an AI Agent Tool](../README.md#using-teamretro-as-an-ai-agent-tool).

## Which key do I need?

| Key | Prefix | Where | Covers |
|---|---|---|---|
| Team-scoped | `trt_` | Team → Settings → Permissions | That one team: actions, agreements, retros, health checks, estimations |
| Account-scoped | `tra_` | Account → Settings → API & SCIM | Everything above across all teams, plus user management, account insights and reports, creating/deleting teams |

Start with a team-scoped key. Reach for the account-scoped one only when an operation
rejects it with a `403` — user management (example 7) is the common case.

Both are entered the same way: **Credentials → New → TeamRetro API**, paste the key, pick
your **Region** (US `api.teamretro.com` or EU `api.eu.teamretro.com`), then **Test**.

## Setting up a TeamRetro Trigger

The trigger receives events over a webhook you register once in TeamRetro:

1. Add the **TeamRetro Trigger** node and tick the events you want.
2. Copy the node's **Production URL** from the *Webhook URLs* tab.
3. In TeamRetro: **Settings → Integrations → Webhooks → Add webhook** — paste the URL,
   tick the same events, save.
4. Copy the **signing secret** TeamRetro shows back into the node's *Signing Secret* field.
   Every delivery is HMAC-verified against it; a mismatch is rejected with `401`.
5. **Activate the workflow**, then hit **Send test** in TeamRetro to confirm.

> n8n's *Listen for test event* button listens on a separate **Test URL**, so it will not
> receive TeamRetro deliveries. Activate the workflow and use TeamRetro's *Send test* instead.

## What the trigger emits

The node hands the workflow a flat item — the envelope, not a raw HTTP request:

```json
{
  "event": "action.created",
  "timestamp": "2024-03-15T10:45:00.000Z",
  "deliveryId": "8rK4lM6nP0qS2tU4vX6yZ8",
  "data": {
    "action": {
      "id": "6uG4iJ8lN1oP3qR5sT7vW9",
      "title": "Update API documentation",
      "priority": "high",
      "created": "2024-03-15T10:45:00.000Z",
      "due": null,
      "completed": null,
      "team": { "id": "7xmNpqrD8fGTuRJqsFLgn0", "name": "Engineering", "tags": ["engineering"] },
      "assignedTo": [{ "id": "5fG7hI9jK1lM3nO5pQ7rS9", "name": "Lucy Webster", "email": "lucy@teamretro.com" }]
    }
  }
}
```

`data` always holds exactly one keyed object, named after the resource the event is about:

| Events | `data` key | Notable fields |
|---|---|---|
| `action.created`, `action.updated`, `action.completed`, `action.deleted`, `action.assignee.changed`, `action.dueDate.changed` | `action` | `title`, `priority`, `due`, `completed`, `team`, `assignedTo[]` |
| `retrospective.created`, `retrospective.completed` | `retrospective` | `title`, `status`, `date`, `team`, `topics[]` |
| `healthCheck.created`, `healthCheck.completed` | `healthCheck` | `title`, `status`, `date`, `team`, `healthModel` |
| `estimation.created`, `estimation.completed` | `estimation` | `title`, `status`, `date`, `team`, `items[]` (completed only) |
| `agreement.created`, `agreement.updated`, `agreement.deleted` | `agreement` | `title`, `created`, `team` |
| `mention.created` | `mention` | `text`, `mentionedUser`, `team`, `meeting` |
| `kudos.created` | `kudos` | `type`, `title`, `sender`, `recipient`, `team`, `meeting` |
| `team.member.invited`, `team.member.deleted` | `member` | `email`, `name`, `teamAdmin`, `team` |

So in an expression: `{{ $json.data.action.title }}`, `{{ $json.data.retrospective.team.name }}`.

Meetings carry a `status` of `open` or `closed` — `closed` means completed, not deleted.

## Two things worth knowing

**`action.updated` is a catch-all.** It fires alongside `action.completed`,
`action.assignee.changed`, and `action.dueDate.changed`. Subscribing to both gives you
duplicates — pick the granular events, or `action.updated` alone.

**Deliveries are at-least-once and unordered.** Deduplicate on `deliveryId` if a repeat
would cause damage (creating a ticket, sending a payment), and order by `timestamp`
rather than arrival.

## Rate limit

The TeamRetro API allows **60 requests per minute**. Account keys each get their own
bucket; all team keys for one team share a single bucket. Example 4 with *Return All*
across a large account is the one most likely to bump into it.
