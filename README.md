# n8n-nodes-teamretro

n8n community node for the [TeamRetro](https://www.teamretro.com/) public API. Automate retrospectives, actions, health checks, estimations, and more from your n8n workflows.

## Links

- [TeamRetro API reference](https://developer.teamretro.com/docs/api) — full REST API documentation.
- [n8n integration overview](https://www.teamretro.com/integrations/n8n) — TeamRetro's overview of the n8n integration.

## Installation

In your n8n instance, go to **Settings → Community nodes → Install** and enter:

```
n8n-nodes-teamretro
```

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) for full instructions. Self-hosted n8n only until the package is n8n-verified; verified packages also appear on n8n Cloud.

## Credentials / Authentication

### Getting an API key

TeamRetro issues two kinds of API keys:

| Key prefix | Scope | Where to create |
|---|---|---|
| `tra_` | **Account-scoped** — full account access. Required for User management, creating/deleting Teams, account Insights, and Reports. | **Account → Settings → API & SCIM** |
| `trt_` | **Team-scoped** — single team only. Sufficient for most per-team operations (Actions, Agreements, Retrospectives, Health Checks, etc.), but some operations are unavailable or return only that team's data. | **Team → Settings → Permissions** |

Copy the key immediately after creation — it is not shown again.

### Setting up the credential in n8n

1. In n8n, open **Credentials → New → TeamRetro API**.
2. Paste your API key into the **API Key** field.
3. Select the correct **Region** (see below).
4. Click **Test** to verify the connection.

### Region

The **Region** selector sets the API host. The node appends `/v1` to the host automatically — paste the host only.

| Region | Host |
|---|---|
| US (default) | `https://api.teamretro.com` |
| EU | `https://api.eu.teamretro.com` |

## Operation Reference

All 79 operations across 16 resources. Select **Resource** then **Operation** in the node UI.

> **Upgrading from 0.2.x?** Nine operations that always returned 404 (their TeamRetro
> endpoints are disabled server-side) were removed. A saved workflow still holding one
> shows a blank Operation dropdown and needs the replacement picked by hand — see the
> Action, Insight and Retrospective tables below and `docs/known-limitations.md`.

### Action
| Operation | Description |
|---|---|
| Get Many | List actions with optional filters (team, status, assignee, due date) — set the **Assigned To** filter for your own actions |
| Create | Create a new action |
| Get | Get a single action by ID |
| Update | Update an action (title, status, due date, assignee, …) |
| Delete | Delete an action |

### Agreement
| Operation | Description |
|---|---|
| Get Many | List agreements |
| Create | Create a new agreement |
| Get | Get a single agreement by ID |
| Update | Update an agreement |
| Delete | Delete an agreement |

### Comment
| Operation | Description |
|---|---|
| Create | Add a comment on an idea, action, agreement, group, or estimation item |
| Update | Update a comment |
| Delete | Delete a comment |

### Estimation
| Operation | Description |
|---|---|
| Get Many | List estimation sessions |
| Create | Create a new estimation session |
| Get | Get a single estimation session by ID |
| Update | Update an estimation session |
| Delete | Delete an estimation session |
| Add Items | Add items to an estimation session |
| Submit Estimate | Cast a vote on an estimation item (see Notes — requires OAuth token) |
| Get Report (Markdown) | Fetch the session report as Markdown text |

### Health Check
| Operation | Description |
|---|---|
| Get Many | List health check sessions |
| Create | Create a new health check session |
| Get | Get a single health check session by ID |
| Update | Update a health check session |
| Delete | Delete a health check session |
| Add Dimension Feedback | Submit feedback for a health check dimension |
| Get Many Dimensions | List dimensions for a health check session |
| Get Report (Markdown) | Fetch the session report as Markdown text |
| Get Summary (Markdown) | Fetch the session summary as Markdown text |

### Health Model
| Operation | Description |
|---|---|
| Get Many | List available health models |
| Get | Get a single health model by slug |

### Insight
| Operation | Description |
|---|---|
| Get Account Insights | Account-level insight snapshot — choose the Metric (activity, actions, action trends, cadence, health latest/trend) |

### Parked Item
| Operation | Description |
|---|---|
| Get Many | List parked items for a team |
| Create | Create a parked item |
| Get | Get a single parked item by slug |
| Update | Update a parked item |
| Delete | Delete a parked item |

### Public Template
| Operation | Description |
|---|---|
| Get Many | List public (library) templates |
| Get | Get a single public template by ID |

### Report
| Operation | Description |
|---|---|
| Get Team Overview Report | Team overview report |
| Get Team Activity Report | Team activity report |
| Get Team Action Activity Report | Team action activity report |
| Get Retrospective Activity Report | Retrospective activity report |
| Get Health Check Activity Report | Health check activity report |
| Get Team Health (Latest) Report | Latest team health report for a health model |
| Get Team Health (Historical) Report | Historical team health report for a health model |
| Get Users Report | Users report |
| Get Team Reports (Batch) | All available reports for a team, in one batch |

### Retrospective
| Operation | Description |
|---|---|
| Get Many | List retrospectives |
| Create | Create a new retrospective |
| Get | Get a single retrospective by slug |
| Update | Update a retrospective |
| Delete | Delete a retrospective |
| Capture Idea | Submit a captured idea to a team |
| Update Idea | Update an idea in a retrospective |
| Delete Idea | Delete an idea from a retrospective |
| Vote | Vote on an idea or group |
| Remove Vote | Remove a vote from an idea or group |
| Get Report (Markdown) | Fetch the retrospective report as Markdown text — includes the ideas and groups |
| Get Summary (Markdown) | Fetch the retrospective summary as Markdown text |

### Search
| Operation | Description |
|---|---|
| Search | Full-text search across TeamRetro content |

### Team
| Operation | Description |
|---|---|
| Get Many | List teams accessible with the current key |
| Create | Create a new team (account-scoped key required) |
| Get | Get a single team by ID |
| Update | Update a team |
| Delete | Delete a team (account-scoped key required) |

### Team Member
| Operation | Description |
|---|---|
| Get Many | List members of a team |
| Get | Get a single team member by email |
| Add | Add a member to a team |
| Update | Update a team member's role |
| Remove | Remove a member from a team |

### Template
| Operation | Description |
|---|---|
| Get Many | List your account's retrospective templates |
| Get | Get a single template by ID |

### User
| Operation | Description |
|---|---|
| Get Many | List users in the account (account-scoped key required) |
| Get | Get a user by email |
| Add | Provision a user |
| Update | Update a user |
| Delete | Delete a user |

## Rate Limit

The TeamRetro API enforces **60 requests per minute**. Account-scoped keys each get their own bucket; all team-scoped keys for the same team share a single per-team bucket. The node paginates list operations sequentially (no parallel fan-out), so large result sets count against this limit.

## Notes & Limitations

**Account-scoped vs team-scoped keys**

- User management, account Insights, account-wide Reports, and creating/deleting Teams require an account-scoped key (`tra_`).
- Team-scoped keys (`trt_`) are clamped to the single team they belong to; operations on other teams return an error.

**Submit Estimate limitation**

The **Estimation → Submit Estimate** operation (`POST /v1/estimations/{meetingSlug}/votes/{estimationItemSlug}`) requires a **user OAuth token** — the TeamRetro API rejects API keys for this endpoint with `403`. This operation cannot be used with the API-key credential this node provides. It is included in the node for completeness, but will not succeed without an OAuth token (which is not supported by this credential type).

**Report CSV endpoints**

Some report endpoints return raw CSV text rather than JSON. Use a **Spreadsheet File** node downstream to parse the CSV into structured data.

**Date fields**

Some date parameters use n8n's `dateTime` picker, which includes a time component, but the underlying TeamRetro API field expects a date-only value (`YYYY-MM-DD`). The node passes the value through; if you see unexpected results, supply a date-only string directly using an expression.

## TeamRetro Trigger

The package ships a **TeamRetro Trigger** node that starts a workflow when a TeamRetro event arrives. Add it, tick the events you want, register its **Production URL** once in TeamRetro, and paste the signing secret back — the node HMAC-verifies every delivery and filters to your selected events.

Setup steps, the payload shape per event, and importable workflows are in [`examples/`](./examples/README.md).

### Events

TeamRetro can fire 19 webhook events:

- **Meetings:** `retrospective.created`, `retrospective.completed`, `healthCheck.created`, `healthCheck.completed`, `estimation.created`, `estimation.completed`
- **Actions:** `action.created`, `action.updated`, `action.deleted`, `action.completed`, `action.assignee.changed`, `action.dueDate.changed`
- **Agreements:** `agreement.created`, `agreement.updated`, `agreement.deleted`
- **People:** `mention.created`, `kudos.created`, `team.member.invited`, `team.member.deleted`

Plus `webhook.test` (sent when you trigger a test delivery from the webhook integration).

### Setup steps

1. **In n8n:** add the **TeamRetro Trigger** node, tick your events, and copy the **Production URL** from the *Webhook URLs* tab.
2. **In TeamRetro:** go to **Settings → Integrations → Webhooks → Add webhook**. In the step-form:
   - **Step 1:** select the same events.
   - **Step 2:** paste the n8n URL into the **Endpoint URL** field, then copy the auto-generated **signing secret** into the trigger's **Signing Secret** field.
   - **Step 3:** activate the workflow in n8n, then send a test delivery to confirm.

> n8n's *Listen for test event* listens on a separate **Test URL** and will not receive TeamRetro deliveries. Activate the workflow and use TeamRetro's **Send test** instead.

### Webhook payload shape

Every delivery is a JSON body with this shape:

```json
{
  "event": "action.created",
  "timestamp": "2026-07-16T10:00:00.000Z",
  "data": { /* event-specific payload */ }
}
```

The trigger emits that envelope (plus `deliveryId`) straight into the workflow, so expressions read `{{ $json.data.action.title }}`. The per-event `data` keys are tabulated in [`examples/README.md`](./examples/README.md#what-the-trigger-emits).

### Fallback — the generic Webhook node

The trigger node above is the supported path. If you would rather use n8n's built-in **Webhook** node, you must verify the HMAC signature yourself.

#### HMAC signature verification

TeamRetro signs every delivery using HMAC-SHA256. The signature is in the request header:

```
X-TeamRetro-Signature: t=<unixTimestamp>,v1=<hexHmac>
```

The signed input string is `<unixTimestamp>.<rawRequestBody>` (timestamp from the header, dot-separated, then the **raw JSON body bytes**). Verify in a Code node before processing the event:

**CRITICAL:** You must enable **"Raw Body"** on the n8n Webhook node, which exposes the unsigned request bytes. Recomputing the HMAC over `JSON.stringify(...)` of the parsed body will **NOT match** TeamRetro's signature — key order and whitespace may differ. Always use the raw body.

The Code node blocks `require()` by default — set `NODE_FUNCTION_ALLOW_BUILTIN=crypto` in your n8n environment to allow the built-in `crypto` module.

```javascript
const crypto = require('crypto'); // requires NODE_FUNCTION_ALLOW_BUILTIN=crypto

const item = $input.first();
const sigHeader = item.json.headers['x-teamretro-signature'] ?? '';
// With "Raw Body" enabled, the raw bytes arrive as base64 in binary.data.data:
const rawBody = Buffer.from(item.binary.data.data, 'base64').toString('utf8');
const secret  = 'YOUR_WEBHOOK_SIGNING_SECRET';         // from TeamRetro's step-form

const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=')));
if (!parts.t || !parts.v1) throw new Error('Missing X-TeamRetro-Signature header');

const expected = crypto
  .createHmac('sha256', secret)
  .update(`${parts.t}.${rawBody}`)
  .digest('hex');
const received = Buffer.from(parts.v1, 'hex');

if (received.length !== 32 || !crypto.timingSafeEqual(received, Buffer.from(expected, 'hex'))) {
  throw new Error('Invalid TeamRetro signature');
}

return $input.all();
```

> **Note:** The signing secret is available in the webhook integration's settings in TeamRetro (you can re-open the form to copy it again). Store it in an n8n **Credential** (or environment variable) — do not hardcode it in the workflow.

Additional headers sent with every delivery:

- `X-TeamRetro-Event-Type` — the event name (e.g. `action.created`)
- `X-TeamRetro-Webhook-Delivery-Id` — unique delivery identifier (use for deduplication)

## Using TeamRetro as an AI Agent Tool

The TeamRetro node is `usableAsTool`, so an **AI Agent** can call it: drag it onto the agent's **Tool** connector and it appears as *TeamRetro Tool*. Each tool node is pinned to one resource + operation, so attach one per capability you want to grant.

**Prerequisites**

- **Self-hosted:** start n8n with `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true`. Without it, community nodes are never offered as agent tools.
- **n8n 2.19 or newer** if you want the ✨ *Defined automatically by the model* button on a **Name** field. Older versions block it for any parameter literally named `name` (an n8n-wide denylist, not specific to this node) — you can still type the expression by hand: `{{ $fromAI('Meeting_Name', 'what the meeting is called', 'string') }}`.

**Three settings decide whether the agent behaves**

Get these wrong and an agent will create a retrospective when you say "hi". That is not a misconfiguration of this node — it is the default tool metadata being too thin.

1. **Set the tool description manually.** Left on *Set Automatically*, n8n derives it from the operation's action: `Create retrospective in TeamRetro`. That reads to a model as an instruction, not a capability. Switch **Tool Description** to *Set Manually* and say when *not* to call it:

   > Creates a NEW retrospective meeting in TeamRetro. This writes data and the meeting becomes visible to everyone on the team. Only call it when the user has explicitly asked to create or schedule a retrospective AND has told you which team it is for. Do not call it to answer greetings or to look something up. If the team, the name or the date is missing, ask the user instead of guessing.

2. **Give every `$fromAI()` a description.** The ✨ button generates `$fromAI('Meeting_Name', ``, 'string')` — with an *empty* description. That is the field the model sees as the parameter's documentation, so an empty one means it will fill the slot with whatever it last read, typically the user's own message. Click **+ Add a description** on every AI-defined field and say what the value is and where it comes from.

3. **Constrain the agent in its system message.** For example:

   ```
   Only call a tool when the user has explicitly asked for that action. Greetings and
   general questions get a plain text answer and no tool call. Never invent a team ID,
   a meeting name or a date — ask. Before any tool that creates or changes data, state
   what you are about to do and wait for confirmation.
   ```

**Pin anything that should not be the model's decision.** `$fromAI()` is opt-in per field — a parameter left as a literal value can't be influenced by the conversation. If the agent should only ever act on one team, type the 22-character team ID into **Team ID** rather than letting the model supply it.

**Prefer read tools for lookups.** Give the agent `Team → Get Many` or `Retrospective → Get Many` so it can resolve a team name to an ID instead of guessing one, and keep the write operations for what the user actually asked for.

A working, importable setup is [example 8](./examples/08-ai-agent-retro-assistant.json).

## Example Workflows

Eight importable workflows — trigger-started, schedule-started, form-started, and chat-started — live in [`examples/`](./examples/README.md), with per-key-scope notes and setup steps on each canvas.

| Workflow | Starts with |
|---|---|
| [Retro completed → Slack digest](./examples/01-retro-completed-slack-digest.json) | TeamRetro Trigger |
| [High-priority action → Slack alert](./examples/02-high-priority-action-alert.json) | TeamRetro Trigger |
| [Kudos → Slack shout-out](./examples/03-kudos-to-slack.json) | TeamRetro Trigger |
| [Weekly overdue actions digest](./examples/04-weekly-overdue-actions-digest.json) | Schedule |
| [Auto-create the sprint retrospective](./examples/05-schedule-sprint-retrospective.json) | Schedule |
| [Health check completed → email summary](./examples/06-healthcheck-completed-email-summary.json) | TeamRetro Trigger |
| [Onboard a user onto a team](./examples/07-onboard-user-to-team.json) | n8n Form (account key) |
| [AI agent retro assistant](./examples/08-ai-agent-retro-assistant.json) | Chat (AI Agent) |

## License

MIT — see [LICENSE](./LICENSE).

## Repository

[https://github.com/TeamRetroHQ/n8n-nodes-teamretro](https://github.com/TeamRetroHQ/n8n-nodes-teamretro)
