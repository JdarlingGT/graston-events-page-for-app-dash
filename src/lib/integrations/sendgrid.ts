/**
 * SendGrid connectivity + rate limit discovery (v3 REST API)
 *
 * Environment variables:
 * - SENDGRID_API_KEY (required) -> Bearer token
 * - SENDGRID_TIMEOUT_MS (optional) default 8000
 *
 * Endpoints tried (read-only where possible):
 * - GET https://api.sendgrid.com/v3/user/account
 * - GET https://api.sendgrid.com/v3/user/credits
 * - GET https://api.sendgrid.com/v3/scopes
 *
 * Typical rate limit headers:
 * - X-RateLimit-Limit
 * - X-RateLimit-Remaining
 * - X-RateLimit-Reset (unix seconds)
 */

export interface SendGridCheckResult {
  ok: boolean;
  authPresent: boolean;
  endpoints: Array<{
    url: string;
    status?: number;
    ok?: boolean;
    error?: string;
  }>;
  rateLimit?: {
    limit?: number;
    remaining?: number;
    reset?: number;
    raw: Record<string, string | null>;
  };
  errors: string[];
  durationMs: number;
  requestId: string;
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

function parseRateLimitHeaders(resp: Response) {
  const get = (h: string) => resp.headers.get(h);
  const toNum = (s: string | null): number | undefined => {
    if (!s) {
return undefined;
}
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  const limitStr = get('x-ratelimit-limit') || get('X-RateLimit-Limit');
  const remainingStr = get('x-ratelimit-remaining') || get('X-RateLimit-Remaining');
  const resetStr = get('x-ratelimit-reset') || get('X-RateLimit-Reset');

  return {
    limit: toNum(limitStr),
    remaining: toNum(remainingStr),
    reset: toNum(resetStr),
    raw: {
      'x-ratelimit-limit': limitStr,
      'x-ratelimit-remaining': remainingStr,
      'x-ratelimit-reset': resetStr,
    },
  };
}

async function tryGet(
  url: string,
  apiKey: string,
  timeoutMs: number,
): Promise<{ status?: number; ok?: boolean; error?: string; resp?: Response }> {
  try {
    const resp = await withTimeout(
      fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }),
      timeoutMs,
    );
    return { status: resp.status, ok: resp.ok, resp };
  } catch (err: any) {
    return { error: err?.message || 'Network error' };
  }
}

export async function checkSendGridConnectivity(): Promise<SendGridCheckResult> {
  const start = Date.now();
  const requestId = `sg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const apiKey = getEnv('SENDGRID_API_KEY');
  const timeoutMs = Number(getEnv('SENDGRID_TIMEOUT_MS', '8000'));

  const authPresent = !!apiKey;
  const endpointsToTry = [
    'https://api.sendgrid.com/v3/user/account',
    'https://api.sendgrid.com/v3/user/credits',
    'https://api.sendgrid.com/v3/scopes',
  ];

  const endpoints: Array<{ url: string; status?: number; ok?: boolean; error?: string }> = [];
  const errors: string[] = [];
  let capturedRateLimit: SendGridCheckResult['rateLimit'] | undefined;

  if (!authPresent) {
    return {
      ok: false,
      authPresent,
      endpoints: endpointsToTry.map((url) => ({ url })),
      rateLimit: undefined,
      errors: ['SENDGRID_API_KEY is missing'],
      durationMs: Date.now() - start,
      requestId,
    };
  }

  for (const url of endpointsToTry) {
    const r = await tryGet(url, apiKey as string, timeoutMs);
    endpoints.push({ url, status: r.status, ok: r.ok, error: r.error });

    if (r.resp) {
      const rate = parseRateLimitHeaders(r.resp);
      if (
        rate?.limit !== undefined ||
        rate?.remaining !== undefined ||
        rate?.reset !== undefined
      ) {
        capturedRateLimit = rate;
      }
      if (!r.resp.ok) {
        try {
          const bodyText = await r.resp.text();
          if (bodyText) {
            errors.push(`GET ${url} -> HTTP ${r.resp.status} ${bodyText.slice(0, 200)}`);
          } else {
            errors.push(`GET ${url} -> HTTP ${r.resp.status}`);
          }
        } catch {
          errors.push(`GET ${url} -> HTTP ${r.resp.status}`);
        }
      }
    } else if (r.error) {
      errors.push(`GET ${url} -> ${r.error}`);
    }
  }

  const ok = authPresent && endpoints.some((e) => e.ok === true);

  return {
    ok,
    authPresent,
    endpoints,
    rateLimit: capturedRateLimit,
    errors,
    durationMs: Date.now() - start,
    requestId,
  };
}