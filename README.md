# n8n-nodes-teamretro

n8n community node for the [TeamRetro](https://www.teamretro.com/) public API. Automate retrospectives, actions, health checks, estimations, and more from your n8n workflows.

> **Package keyword:** `n8n-community-node-package`

## Installation

In your n8n instance, go to **Settings → Community nodes → Install** and enter:

```
n8n-nodes-teamretro
```

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) for full instructions. Self-hosted n8n only until the package is n8n-verified; verified packages also appear on n8n Cloud.

> **Dev / pre-release builds** are published to GitHub Packages as `@groupmapptyltd/n8n-nodes-teamretro`. The public npm release is the unscoped `n8n-nodes-teamretro`.

## Credentials / Authentication

### Getting an API key

TeamRetro issues two kinds of API keys:

| Key prefix | Scope | Where to create |
|---|---|---|
| `tra_` | **Account-scoped** — full account access. Required for User management, creating/deleting Teams, account Insights, and Reports. | Account **Settings → API & SCIM** |
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
| Custom | any base URL you enter |

## Operation Reference

All 88 operations across 16 resources. Select **Resource** then **Operation** in the node UI.

### Action
| Operation | Description |
|---|---|
| Get Many | List actions with optional filters (team, status, assignee, due date) |
| Get Many (Assigned to Me) | List actions assigned to the authenticated user |
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
| Create | Add a comment on an idea, action, group, or estimation item |
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
| Get Account Insights | Account-level insight snapshot |
| Get Activity Insights | Activity insight |
| Get Action Insights | Actions insight |
| Get Action Trends | Action trend data |
| Get Latest Health Ratings | Latest health check results |
| Get Health Rating Trends | Health trend data |
| Get Meeting Cadence | Meeting cadence insight |

### Parked Item
| Operation | Description |
|---|---|
| Get Many | List parked items for a team |
| Create | Create a parked item (requires `parkingLot` plan feature — see Notes) |
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
| Get Team Overview Report | `GET /v1/reports/team-overview` |
| Get Team Activity Report | `GET /v1/reports/team-activity` |
| Get Team Action Activity Report | `GET /v1/reports/team-action-activity` |
| Get Retrospective Activity Report | `GET /v1/reports/retrospective-activity` |
| Get Health Check Activity Report | `GET /v1/reports/health-check-activity` |
| Get Team Health (Latest) Report | `GET /v1/reports/health/{healthModelId}/team-health-latest` |
| Get Team Health (Historical) Report | `GET /v1/reports/health/{healthModelId}/team-health-historical` |
| Get Users Report | `GET /v1/reports/users` |
| Get Team Reports (Batch) | `GET /v1/teams/{teamId}/reports` |

### Retrospective
| Operation | Description |
|---|---|
| Get Many | List retrospectives |
| Create | Create a new retrospective |
| Get | Get a single retrospective by slug |
| Update | Update a retrospective |
| Delete | Delete a retrospective |
| Get Many Ideas | List ideas in a retrospective |
| Get Many Groups | List idea groups in a retrospective |
| Capture Idea | Submit a captured idea to a team |
| Update Idea | Update an idea in a retrospective |
| Delete Idea | Delete an idea from a retrospective |
| Vote | Vote on an idea or group |
| Remove Vote | Remove a vote from an idea or group |
| Get Report (Markdown) | Fetch the retrospective report as Markdown text |
| Get Summary (Markdown) | Fetch the retrospective summary as Markdown text |

### Search
| Operation | Description |
|---|---|
| Search | Full-text search across TeamRetro content (requires `search.enabled` plan feature — see Notes) |

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

The TeamRetro API enforces **60 requests per minute per API key**. The node paginates list operations sequentially (no parallel fan-out), so large result sets count against this limit.

## Notes & Limitations

**Account-scoped vs team-scoped keys**

- User management, account Insights, account-wide Reports, and creating/deleting Teams require an account-scoped key (`tra_`).
- Team-scoped keys (`trt_`) are clamped to the single team they belong to; operations on other teams return an error.

**Plan feature gating**

Some operations require specific plan features to be enabled on your TeamRetro account:

- **Parked Items** require the `parkingLot` feature. Accounts without it receive a `403` error.
- **Search** requires the `search.enabled` feature. Accounts without it receive a `403` error.
- **Webhook triggers** (for the recipe below) require the `integrations.webhook` feature.

**Submit Estimate limitation**

The **Estimation → Submit Estimate** operation (`POST /v1/estimations/{meetingSlug}/votes/{estimationItemSlug}`) requires a **user OAuth token** — the TeamRetro API rejects API keys for this endpoint with `403`. This operation cannot be used with the API-key credential this node provides. It is included in the node for completeness, but will not succeed without an OAuth token (which is not supported by this credential type).

**Report CSV endpoints**

Some report endpoints return raw CSV text rather than JSON. Use a **Spreadsheet File** node downstream to parse the CSV into structured data.

**Date fields**

Some date parameters use n8n's `dateTime` picker, which includes a time component, but the underlying TeamRetro API field expects a date-only value (`YYYY-MM-DD`). The node passes the value through; if you see unexpected results, supply a date-only string directly using an expression.

## Trigger Recipe — Webhook

This package does not ship a trigger node. Instead, use n8n's built-in **Webhook** node combined with TeamRetro's existing webhook integration to receive real-time events.

### Events

TeamRetro can fire 20 webhook events:

- **Meetings:** `retrospective.created`, `retrospective.completed`, `healthCheck.created`, `healthCheck.completed`, `estimation.created`, `estimation.completed`
- **Actions:** `action.created`, `action.updated`, `action.deleted`, `action.completed`, `action.assignee.changed`, `action.dueDate.changed`
- **Agreements:** `agreement.created`, `agreement.updated`, `agreement.deleted`
- **People:** `mention.created`, `kudos.created`, `team.member.invited`, `team.member.deleted`

Plus `webhook.test` (sent when you save the integration).

### Setup steps

1. **In n8n:** add a **Webhook** node, set **HTTP Method** to `POST`, and copy the **Production URL**.
2. **In TeamRetro:** go to **Settings → Integrations → Webhooks → Add webhook**. In the step-form:
   - **Step 1:** select the events you want.
   - **Step 2:** paste the n8n Webhook URL into the **Endpoint URL** field. Copy the auto-generated **signing secret** — you need it for HMAC verification.
   - **Step 3:** send a test delivery to confirm the connection.
3. **In n8n:** add a **Code** node after the Webhook node to verify the signature before acting on the event.

### Webhook payload shape

Every delivery is a JSON body with this shape:

```json
{
  "event": "action.created",
  "timestamp": "2026-07-16T10:00:00.000Z",
  "data": { /* event-specific payload */ }
}
```

### HMAC signature verification

TeamRetro signs every delivery using HMAC-SHA256. The signature is in the request header:

```
X-TeamRetro-Signature: t=<unixTimestamp>,v1=<hexHmac>
```

The signed input string is `<unixTimestamp>.<rawRequestBody>` (timestamp from the header, dot-separated, then the **raw JSON body bytes**). Verify in a Code node before processing the event:

**CRITICAL:** You must enable **"Raw Body"** on the n8n Webhook node, which exposes the unsigned request bytes. Recomputing the HMAC over `JSON.stringify($input.first().body)` will **NOT match** TeamRetro's signature — key order and whitespace may differ. Always use the raw body:

```javascript
const crypto = require('crypto');

const sigHeader = $input.first().headers['x-teamretro-signature'];
// Enable "Raw Body" on the Webhook node. Raw bytes arrive as base64 in binary.data:
const rawBody   = Buffer.from($input.first().binary.data, 'base64').toString('utf8');
const secret    = 'YOUR_WEBHOOK_SIGNING_SECRET';       // from TeamRetro's step-form

const [tPart, v1Part] = sigHeader.split(',');
const timestamp = tPart.replace('t=', '');
const received  = v1Part.replace('v1=', '');

const expected = crypto
  .createHmac('sha256', secret)
  .update(`${timestamp}.${rawBody}`)
  .digest('hex');

if (!crypto.timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'))) {
  throw new Error('Invalid TeamRetro signature');
}

return $input.all();
```

> **Note:** The signing secret is shown only when you create the webhook integration in TeamRetro. Store it in an n8n **Credential** (or environment variable) — do not hardcode it in the workflow.

Additional headers sent with every delivery:

- `X-TeamRetro-Event-Type` — the event name (e.g. `action.created`)
- `X-TeamRetro-Webhook-Delivery-Id` — unique delivery identifier (use for deduplication)

### Example workflow

See [`examples/on-webhook-create-action.json`](./examples/on-webhook-create-action.json) for an importable n8n workflow that receives a webhook delivery and creates a TeamRetro action.

## License

MIT — see [LICENSE](./LICENSE).

## Repository

[https://github.com/TeamRetroHQ/n8n-nodes-teamretro](https://github.com/TeamRetroHQ/n8n-nodes-teamretro)
