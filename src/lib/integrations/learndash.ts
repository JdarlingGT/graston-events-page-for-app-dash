/**
 * LearnDash REST API connectivity + rate limit discovery
 *
 * Environment variables:
 * - LEARNDASH_BASE_URL (preferred) e.g. https://example.com
 * - ACF_BASE_URL / FLUENTCRM_BASE_URL / WOOCOMMERCE_BASE_URL (fallbacks) if LEARNDASH_BASE_URL not set
 * - LEARNDASH_BASIC_AUTH (optional) base64("username:application_password") or WP user:app password
 * - LEARNDASH_TIMEOUT_MS (optional) default 8000
 *
 * Endpoints tried:
 * - /wp-json                    (WordPress presence)
 * - /wp-json/ldlms/v2           (LearnDash namespace root)
 * - /wp-json/ldlms/v2/courses?per_page=1
 * - /wp-json/ldlms/v2/users?per_page=1
 *
 * Captures common rate limit headers if present:
 * - retry-after, x-ratelimit-*
 */

export type LdAuthMode = 'basic' | 'none';

export interface LdCheckResult {
  ok: boolean;
  wordpressReachable: boolean;
  learndashReachable: boolean;
  detectedBase: string | null;
  triedEndpoints: string[];
  statusCodes: Record<string, number | undefined>;
  rateLimit?: {
    limit?: number;
    remaining?: number;
    reset?: number;
    retryAfterSeconds?: number;
    raw: Record<string, string | null>;
  };
  authModeTried: LdAuthMode[];
  errors: Array<{ endpoint: string; error: string }>;
  durationMs: number;
  env: {
    baseUrl: 'present' | 'missing';
    basicAuth: 'present' | 'missing';
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

function buildHeaders(mode: LdAuthMode, basicAuth?: string): HeadersInit {
  if (mode === 'basic' && basicAuth) {
    return { Authorization: `Basic ${basicAuth}` };
  }
  return {};
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

  const limitStr = get('x-ratelimit-limit');
  const remainingStr = get('x-ratelimit-remaining');
  const resetStr = get('x-ratelimit-reset');
  const retryAfterStr = get('retry-after');

  return {
    limit: toNum(limitStr),
    remaining: toNum(remainingStr),
    reset: toNum(resetStr),
    retryAfterSeconds: toNum(retryAfterStr),
    raw: {
      'x-ratelimit-limit': limitStr,
      'x-ratelimit-remaining': remainingStr,
      'x-ratelimit-reset': resetStr,
      'retry-after': retryAfterStr,
    },
  };
}

async function tryFetch(
  base: string,
  path: string,
  mode: LdAuthMode,
  basicAuth: string | undefined,
  timeoutMs: number,
): Promise<{ endpoint: string; response?: Response; error?: Error }> {
  const endpoint = new URL(path, base).toString();
  const headers = buildHeaders(mode, basicAuth);

  try {
    const response = await withTimeout(fetch(endpoint, { headers }), timeoutMs);
    return { endpoint, response };
  } catch (error: any) {
    return { endpoint, error };
  }
}

export async function checkLearnDashConnectivity(): Promise<LdCheckResult> {
  const start = Date.now();

  // Prefer LearnDash base; fallback to other known WP bases if provided
  const baseUrl =
    getEnv('LEARNDASH_BASE_URL') ||
    getEnv('ACF_BASE_URL') ||
    getEnv('FLUENTCRM_BASE_URL') ||
    getEnv('WOOCOMMERCE_BASE_URL');

  const basicAuth = getEnv('LEARNDASH_BASIC_AUTH');
  const timeoutMs = Number(getEnv('LEARNDASH_TIMEOUT_MS', '8000'));

  const env = {
    baseUrl: baseUrl ? 'present' as const : 'missing' as const,
    basicAuth: basicAuth ? 'present' as const : 'missing' as const,
  };

  const triedEndpoints: string[] = [];
  const statusCodes: Record<string, number | undefined> = {};
  const errors: Array<{ endpoint: string; error: string }> = [];
  const authModeTried: LdAuthMode[] = [];

  if (!baseUrl) {
    return {
      ok: false,
      wordpressReachable: false,
      learndashReachable: false,
      detectedBase: null,
      triedEndpoints,
      statusCodes,
      rateLimit: undefined,
      authModeTried,
      errors: [{ endpoint: 'config', error: 'LEARNDASH_BASE_URL (or fallback) not configured' }],
      durationMs: Date.now() - start,
      env,
    };
  }

  // 1) Check WordPress root /wp-json
  let wpOk = false;
  {
    const r = await tryFetch(baseUrl, '/wp-json', 'none', basicAuth, timeoutMs);
    triedEndpoints.push(r.endpoint);
    if (r.response) {
      statusCodes[r.endpoint] = r.response.status;
      wpOk = r.response.ok;
    } else if (r.error) {
      errors.push({ endpoint: r.endpoint, error: r.error.message });
    }
  }

  // 2) Try LearnDash endpoints
  const paths = ['/wp-json/ldlms/v2', '/wp-json/ldlms/v2/courses?per_page=1', '/wp-json/ldlms/v2/users?per_page=1'];
  const modes: LdAuthMode[] = [
    ...(basicAuth ? (['basic'] as LdAuthMode[]) : []),
    'none',
  ];

  let ldOk = false;
  let detectedBase: string | null = null;
  let capturedRateLimit: LdCheckResult['rateLimit'] | undefined;

  for (const path of paths) {
    for (const mode of modes) {
      authModeTried.push(mode);

      const r = await tryFetch(baseUrl, path, mode, basicAuth, timeoutMs);
      triedEndpoints.push(`${r.endpoint} [${mode}]`);

      if (r.response) {
        statusCodes[`${r.endpoint} [${mode}]`] = r.response.status;

        const rate = parseRateLimitHeaders(r.response);
        if (
          rate?.limit !== undefined ||
          rate?.remaining !== undefined ||
          rate?.retryAfterSeconds !== undefined
        ) {
          capturedRateLimit = rate;
        }

        if (r.response.ok) {
          ldOk = true;
          detectedBase = r.endpoint.replace(/\/wp-json\/.*$/, '/wp-json');
          break;
        }

        // Non-OK statuses still indicate reachability of namespace
        if (
          !detectedBase &&
          (r.response.status === 401 || r.response.status === 403 || r.response.status === 404)
        ) {
          detectedBase = r.endpoint.replace(/\/wp-json\/.*$/, '/wp-json');
        }
      } else if (r.error) {
        errors.push({ endpoint: `${r.endpoint} [${mode}]`, error: r.error.message });
      }
    }
    if (ldOk) {
break;
}
  }

  const ok = wpOk && (ldOk || !!detectedBase);

  return {
    ok,
    wordpressReachable: wpOk,
    learndashReachable: ldOk,
    detectedBase,
    triedEndpoints,
    statusCodes,
    rateLimit: capturedRateLimit,
    authModeTried,
    errors,
    durationMs: Date.now() - start,
    env,
  };
}