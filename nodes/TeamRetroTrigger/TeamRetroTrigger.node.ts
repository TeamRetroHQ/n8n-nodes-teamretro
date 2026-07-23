import type {
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { verifyWebhookSignature } from '../TeamRetro/shared/verifyWebhook';
import { webhookEventOptions } from '../TeamRetro/shared/webhookEvents';

// ponytail: two rules disabled by intent, not oversight. A webhook trigger is not
// AI-tool-callable (node-usable-as-tool), and v1 is manual-paste by design — no
// checkExists/create/delete (webhook-lifecycle-complete). Auto-register lands when the
// TeamRetro /v1/webhooks API is un-gated; drop the second disable then.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool, @n8n/community-nodes/webhook-lifecycle-complete
export class TeamRetroTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'TeamRetro Trigger',
    name: 'teamRetroTrigger',
    icon: { light: 'file:TeamRetro.svg', dark: 'file:TeamRetro.dark.svg' },
    group: ['trigger'],
    version: 1,
    subtitle: '={{ ($parameter["events"] || []).join(", ") }}',
    description: 'Starts the workflow when a subscribed TeamRetro event is received',
    defaults: { name: 'TeamRetro Trigger' },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    // Attached but optional in v1 (manual paste). The future auto-register create() needs it.
    credentials: [{ name: 'teamRetroApi', required: false }],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
        // Capture the unparsed body so HMAC verification sees the exact signed bytes.
        rawBody: true,
      },
    ],
    properties: [
      {
        displayName:
          'Copy this node\'s <b>Production URL</b> (Webhook URLs tab above). In TeamRetro go to ' +
          '<b>Settings → Integrations → Webhooks → Add webhook</b>, paste it as the Endpoint URL, ' +
          'tick the same events you select below, and save. Copy the signing secret TeamRetro shows ' +
          'and paste it into the <b>Signing Secret</b> field below so deliveries can be verified. ' +
          'To test the connection, <b>activate this workflow</b> then click <b>Send test</b> in ' +
          'TeamRetro — a success there confirms the URL and secret. (n8n\'s "Listen for test event" ' +
          'listens on a separate Test URL, so it will not receive TeamRetro deliveries.)',
        name: 'setupNotice',
        type: 'notice',
        default: '',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        required: true,
        default: [],
        description: 'The TeamRetro events that should start this workflow. Tick the same events in the TeamRetro webhook form.',
        options: webhookEventOptions,
      },
      {
        displayName: 'Signing Secret',
        name: 'signingSecret',
        type: 'string',
        typeOptions: { password: true },
        required: true,
        default: '',
        description: 'The signing secret TeamRetro shows when you create the webhook. Every delivery is HMAC-verified against it and rejected on mismatch.',
      },
    ],
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const headers = this.getHeaderData();
    const signature = headers['x-teamretro-signature'] as string | undefined;
    const secret = this.getNodeParameter('signingSecret') as string;
    const selectedEvents = this.getNodeParameter('events', []) as string[];

    // rawBody is populated by n8n because the webhook description sets rawBody: true.
    const rawBody = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : '';

    if (!verifyWebhookSignature(signature, rawBody, secret)) {
      const res = this.getResponseObject();
      res.status(401).send('Invalid or missing TeamRetro webhook signature');
      return { noWebhookResponse: true };
    }

    const body = this.getBodyData() as { event?: string; timestamp?: string; data?: unknown };

    // TeamRetro's "Send test" sends a synthetic, HMAC-signed `webhook.test` delivery. Its only job
    // is to confirm the URL + signing secret: a passing signature (verified above) already proves
    // setup, so on a live workflow (mode !== 'manual') we ack 200 but never inject synthetic test
    // data downstream. Only surface it during n8n's "Listen for test event" (manual mode), where
    // the user is explicitly watching for the captured event.
    if (body.event === 'webhook.test') {
      if (this.getMode() !== 'manual') return {};
    } else if (!body.event || !selectedEvents.includes(body.event)) {
      // Defend the node even if the pasted TeamRetro webhook is scoped more broadly than the
      // selected events: ack 200 but do not start the workflow.
      return {};
    }

    const deliveryId = headers['x-teamretro-webhook-delivery-id'] as string | undefined;
    const json: IDataObject = {
      event: body.event,
      timestamp: body.timestamp,
      data: (body.data ?? {}) as IDataObject,
    };
    if (deliveryId) json.deliveryId = deliveryId;

    return { workflowData: [[{ json }]] };
  }
}
