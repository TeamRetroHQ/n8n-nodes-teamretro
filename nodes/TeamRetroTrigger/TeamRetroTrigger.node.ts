import type {
  IDataObject,
  IHookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { verifyWebhookSignature } from '../TeamRetro/shared/verifyWebhook';
import { webhookEventOptions } from '../TeamRetro/shared/webhookEvents';

export class TeamRetroTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'TeamRetro Trigger',
    name: 'teamRetroTrigger',
    icon: { light: 'file:TeamRetro.svg', dark: 'file:TeamRetro.dark.svg' },
    group: ['trigger'],
    version: 1,
    subtitle: '={{ ($parameter["events"] || []).join(", ") }}',
    description: 'Starts the workflow when a subscribed TeamRetro event is received',
    // Declared, not omitted: a trigger has no execute() for an agent to call — it is started by
    // an inbound delivery — so it must not be wrapped as a tool. n8n types this as
    // `true | UsableAsToolDescription`, so `undefined` is the only way to say "no" out loud.
    usableAsTool: undefined,
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

  // ponytail: no-op lifecycle, not an oversight. v1 is manual-paste — the user creates the
  // webhook in TeamRetro's UI, so there is nothing for n8n to register or tear down.
  // checkExists reports true so n8n never calls create, and delete leaves the user's
  // TeamRetro-side webhook alone. Swap these for real /v1/webhooks calls when that API is
  // un-gated; the optional teamRetroApi credential is already attached for it.
  webhookMethods: INodeType['webhookMethods'] = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        return true;
      },
    },
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
