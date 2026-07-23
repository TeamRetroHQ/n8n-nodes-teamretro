import { createHmac, timingSafeEqual } from 'crypto';

// Verify a TeamRetro webhook signature. Header shape: "t=<unixSeconds>,v1=<hexHmacSha256>";
// signed input is `<t>.<rawBody>`. Ported verbatim from zapier-teamretro/lib/verifyWebhook.js —
// the raw request body (not re-serialized JSON) MUST be passed, or the HMAC will not match.
export function verifyWebhookSignature(
  signatureHeader: string | undefined,
  rawBody: string,
  secret: string,
): boolean {
  if (!signatureHeader || !rawBody || !secret) return false;

  const parts: Record<string, string> = {};
  for (const seg of String(signatureHeader).split(',')) {
    const idx = seg.indexOf('=');
    if (idx === -1) continue;
    parts[seg.slice(0, idx).trim()] = seg.slice(idx + 1).trim();
  }
  const timestamp = parts.t;
  const received = parts.v1;
  if (!timestamp || !received) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  // Buffer.from(x, 'hex') silently drops invalid/odd nibbles rather than throwing, so a non-hex
  // or wrong-length v1 yields a buffer whose length won't match `expected` — caught below.
  const a = Buffer.from(received, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}
