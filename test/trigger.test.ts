import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import type { IWebhookFunctions } from 'n8n-workflow';
import { verifyWebhookSignature } from '../nodes/TeamRetro/shared/verifyWebhook';
import { webhookEventOptions, webhookEventValues } from '../nodes/TeamRetro/shared/webhookEvents';
import { TeamRetroTrigger } from '../nodes/TeamRetroTrigger/TeamRetroTrigger.node';

const SECRET = 'shhh-signing-secret';
const RAW = JSON.stringify({
  event: 'action.created',
  timestamp: '2026-07-20T00:00:00Z',
  data: { id: 'a1' },
});
const T = '1700000000';
const sign = (raw = RAW, secret = SECRET, t = T) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex')}`;

describe('verifyWebhookSignature', () => {
  it('accepts a valid signature', () => {
    expect(verifyWebhookSignature(sign(), RAW, SECRET)).toBe(true);
  });
  it('rejects a wrong secret', () => {
    expect(verifyWebhookSignature(sign(RAW, 'not-the-secret'), RAW, SECRET)).toBe(false);
  });
  it('rejects a tampered body', () => {
    expect(verifyWebhookSignature(sign(), RAW + ' ', SECRET)).toBe(false);
  });
  it('rejects a missing header', () => {
    expect(verifyWebhookSignature(undefined, RAW, SECRET)).toBe(false);
  });
  it('rejects a malformed header (no v1 part)', () => {
    expect(verifyWebhookSignature(`t=${T}`, RAW, SECRET)).toBe(false);
  });
  it('rejects a non-hex / length-mismatched signature', () => {
    expect(verifyWebhookSignature(`t=${T},v1=zzzz`, RAW, SECRET)).toBe(false);
  });
});

describe('webhook event registry', () => {
  it('exposes exactly the 19 user-facing events', () => {
    expect(webhookEventValues.slice().sort()).toEqual(
      [
        'action.assignee.changed',
        'action.completed',
        'action.created',
        'action.deleted',
        'action.dueDate.changed',
        'action.updated',
        'agreement.created',
        'agreement.deleted',
        'agreement.updated',
        'estimation.completed',
        'estimation.created',
        'healthCheck.completed',
        'healthCheck.created',
        'kudos.created',
        'mention.created',
        'retrospective.completed',
        'retrospective.created',
        'team.member.deleted',
        'team.member.invited',
      ].sort(),
    );
  });
  it('excludes integration-plumbing events', () => {
    for (const plumbing of [
      'action.published',
      'action.publishFailed',
      'integration.error',
      'integration.token.expiring',
      'integration.disabled',
    ]) {
      expect(webhookEventValues).not.toContain(plumbing);
    }
  });
  it('options are alphabetized by display name (linter requirement)', () => {
    const names = webhookEventOptions.map((o) => o.name);
    expect(names).toEqual(names.slice().sort());
  });
});

describe('TeamRetroTrigger description', () => {
  const d = new TeamRetroTrigger().description;

  it('is a webhook trigger with rawBody capture', () => {
    expect(d.group).toEqual(['trigger']);
    expect(d.inputs).toEqual([]);
    expect(d.webhooks?.[0]).toMatchObject({
      name: 'default',
      httpMethod: 'POST',
      responseMode: 'onReceived',
      path: 'webhook',
      rawBody: true,
    });
  });

  it('has a no-op webhookMethods lifecycle (manual-paste v1)', async () => {
    const m = new TeamRetroTrigger().webhookMethods?.default;
    expect(Object.keys(m ?? {}).sort()).toEqual(['checkExists', 'create', 'delete']);
    // checkExists true => n8n skips create; delete never touches the user's TeamRetro webhook.
    const ctx = {} as never;
    expect(await m!.checkExists.call(ctx)).toBe(true);
    expect(await m!.create.call(ctx)).toBe(true);
    expect(await m!.delete.call(ctx)).toBe(true);
  });

  it('is not usable as an AI tool', () => {
    expect('usableAsTool' in d).toBe(true);
    expect(d.usableAsTool).toBeUndefined();
  });

  it('attaches teamRetroApi credential as optional', () => {
    expect(d.credentials).toEqual([{ name: 'teamRetroApi', required: false }]);
  });

  it('exposes 19 events and a required password Signing Secret', () => {
    const events = d.properties.find((p) => p.name === 'events');
    expect(events?.type).toBe('multiOptions');
    expect(events?.required).toBe(true);
    expect((events?.options ?? []).length).toBe(19);

    const secret = d.properties.find((p) => p.name === 'signingSecret');
    expect(secret?.type).toBe('string');
    expect(secret?.required).toBe(true);
    expect(secret?.typeOptions?.password).toBe(true);
  });
});

// Minimal fake IWebhookFunctions covering only what webhook() reads.
function fakeCtx(opts: {
  rawBody: string;
  signature?: string;
  events: string[];
  secret?: string;
  deliveryId?: string;
  mode?: string;
}) {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  const headers: Record<string, string> = {};
  if (opts.signature !== undefined) headers['x-teamretro-signature'] = opts.signature;
  if (opts.deliveryId) headers['x-teamretro-webhook-delivery-id'] = opts.deliveryId;

  const ctx = {
    getMode: () => opts.mode ?? 'trigger',
    getRequestObject: () => ({ rawBody: Buffer.from(opts.rawBody, 'utf8') }),
    getHeaderData: () => headers,
    getBodyData: () => JSON.parse(opts.rawBody),
    getResponseObject: () => res,
    getNodeParameter: (name: string, fallback?: unknown) =>
      name === 'signingSecret'
        ? (opts.secret ?? SECRET)
        : name === 'events'
          ? opts.events
          : fallback,
  } as unknown as IWebhookFunctions;

  return { ctx, res };
}

describe('TeamRetroTrigger webhook()', () => {
  const node = new TeamRetroTrigger();

  it('emits workflow data on a valid, selected event', async () => {
    const { ctx, res } = fakeCtx({ rawBody: RAW, signature: sign(), events: ['action.created'] });
    const result = await node.webhook.call(ctx);
    expect(res.statusCode).toBe(0); // never touched the response object
    const json = result.workflowData?.[0]?.[0]?.json as Record<string, unknown>;
    expect(json).toMatchObject({
      event: 'action.created',
      timestamp: '2026-07-20T00:00:00Z',
      data: { id: 'a1' },
    });
  });

  it('passes through the delivery id when present', async () => {
    const { ctx } = fakeCtx({
      rawBody: RAW,
      signature: sign(),
      events: ['action.created'],
      deliveryId: 'del-123',
    });
    const result = await node.webhook.call(ctx);
    const json = result.workflowData?.[0]?.[0]?.json as Record<string, unknown>;
    expect(json.deliveryId).toBe('del-123');
  });

  it('acks 200 without triggering on an unselected event', async () => {
    const { ctx, res } = fakeCtx({ rawBody: RAW, signature: sign(), events: ['retrospective.completed'] });
    const result = await node.webhook.call(ctx);
    expect(result.workflowData).toBeUndefined();
    expect(result.noWebhookResponse).toBeUndefined();
    expect(res.statusCode).toBe(0);
  });

  it('rejects a bad signature with 401 and no trigger', async () => {
    const { ctx, res } = fakeCtx({ rawBody: RAW, signature: sign(RAW, 'wrong'), events: ['action.created'] });
    const result = await node.webhook.call(ctx);
    expect(result.noWebhookResponse).toBe(true);
    expect(result.workflowData).toBeUndefined();
    expect(res.statusCode).toBe(401);
  });

  it('rejects a missing signature header with 401', async () => {
    const { ctx, res } = fakeCtx({ rawBody: RAW, events: ['action.created'] });
    const result = await node.webhook.call(ctx);
    expect(result.noWebhookResponse).toBe(true);
    expect(res.statusCode).toBe(401);
  });

  it('emits a signed webhook.test delivery in manual "Listen for test event" mode', async () => {
    // While the user is listening for a test event, the synthetic webhook.test must bypass the
    // event filter and emit so they see the captured delivery.
    const testBody = JSON.stringify({ event: 'webhook.test', timestamp: '2026-07-20T00:00:00Z', data: { ok: true } });
    const { ctx, res } = fakeCtx({ rawBody: testBody, signature: sign(testBody), events: ['action.created'], mode: 'manual' });
    const result = await node.webhook.call(ctx);
    expect(res.statusCode).toBe(0);
    const json = result.workflowData?.[0]?.[0]?.json as Record<string, unknown>;
    expect(json).toMatchObject({ event: 'webhook.test', data: { ok: true } });
  });

  it('acks a webhook.test on a live workflow without injecting synthetic data', async () => {
    // On an active workflow (production/trigger mode) a TeamRetro "Send test" verifies the URL +
    // secret (200 ack) but must NOT start the workflow with fake data.
    const testBody = JSON.stringify({ event: 'webhook.test', timestamp: '2026-07-20T00:00:00Z', data: { ok: true } });
    const { ctx, res } = fakeCtx({ rawBody: testBody, signature: sign(testBody), events: ['action.created'], mode: 'trigger' });
    const result = await node.webhook.call(ctx);
    expect(result.workflowData).toBeUndefined();
    expect(result.noWebhookResponse).toBeUndefined();
    expect(res.statusCode).toBe(0);
  });

  it('still HMAC-rejects a webhook.test delivery signed with the wrong secret (401)', async () => {
    // Verification stays first: a mis-configured secret makes "Send test" return failure to the user.
    const testBody = JSON.stringify({ event: 'webhook.test', timestamp: '2026-07-20T00:00:00Z', data: {} });
    const { ctx, res } = fakeCtx({ rawBody: testBody, signature: sign(testBody, 'wrong'), events: ['action.created'] });
    const result = await node.webhook.call(ctx);
    expect(result.noWebhookResponse).toBe(true);
    expect(res.statusCode).toBe(401);
  });
});
