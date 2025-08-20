/**
 * Slack Webhook connectivity and rate limit discovery
 *
 * Environment variables:
 * - SLACK_WEBHOOK_URL (required)
 * - SLACK_TIMEOUT_MS (optional) default 8000
 *
 * Behavior:
 * - Sends a lightweight connectivity_check payload to the webhook
 * - Captures HTTP status and relevant rate limit headers (notably Retry-After on 429)
 */

export interface SlackCheckResult {
  ok: boolean;
  httpStatus?: number;
  durationMs: number;
  endpoint: string | null;
  requestId: string;
  errors: string[];
  rateLimit?: {
    retryAfterSeconds?: number;
    raw: Record<string, string | null>;
  };
  env: {
    webhookUrl: 'present' | 'missing';
  };
}

function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') {
return fallback;
}
  return v;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

function parseRateLimitHeaders(resp: Response): SlackCheckResult['rateLimit'] {
  const retryAfter = resp.headers.get('retry-after');
  const toNum = (s: string | null): number | undefined => {
    if (!s) {
return undefined;
}
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    retryAfterSeconds: toNum(retryAfter),
    raw: {
      'retry-after': retryAfter,
      'x-ratelimit-limit': resp.headers.get('x-ratelimit-limit'),
      'x-ratelimit-remaining': resp.headers.get('x-ratelimit-remaining'),
      'x-ratelimit-reset': resp.headers.get('x-ratelimit-reset'),
    },
  };
}

export async function checkSlackWebhookConnectivity(): Promise<SlackCheckResult> {
  const start = Date.now();
  const requestId = `slack_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const webhookUrl = getEnv('SLACK_WEBHOOK_URL');
  const timeoutMs = Number(getEnv('SLACK_TIMEOUT_MS', '8000'));

  const envPresence = {
    webhookUrl: webhookUrl ? 'present' as const : 'missing' as const,
  };

  if (!webhookUrl) {
    return {
      ok: false,
      httpStatus: undefined,
      durationMs: Date.now() - start,
      endpoint: null,
      requestId,
      errors: ['SLACK_WEBHOOK_URL is missing'],
      rateLimit: undefined,
      env: envPresence,
    };
  }

  // Minimal Slack message; Slack expects either "text" or "blocks"
  const payload = {
    text: `Connectivity check (${requestId})`,
  };

  try {
    const resp = await withTimeout(
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      timeoutMs,
    );

    const httpStatus = resp.status;
    const ok = resp.ok;
    const rateLimit = parseRateLimitHeaders(resp);

    let errors: string[] = [];
    if (!ok) {
      // Attempt to collect response text for diagnostics (best-effort)
      try {
        const txt = await resp.text();
        if (txt) {
errors.push(`Response: ${txt}`);
}
      } catch {
        // ignore
      }
      errors = [`HTTP ${httpStatus}`, ...errors];
    }

    return {
      ok,
      httpStatus,
      durationMs: Date.now() - start,
      endpoint: webhookUrl,
      requestId,
      errors,
      rateLimit,
      env: envPresence,
    };
  } catch (err: any) {
    return {
      ok: false,
      httpStatus: undefined,
      durationMs: Date.now() - start,
      endpoint: webhookUrl,
      requestId,
      errors: [err?.message || 'Network error'],
      rateLimit: undefined,
      env: envPresence,
    };
  }
}