/**
 * Advanced Custom Fields (ACF) REST API connectivity + rate limit discovery
 *
 * Environment variables:
 * - ACF_BASE_URL (preferred) e.g. https://example.com
 * - FLUENTCRM_BASE_URL / WOOCOMMERCE_BASE_URL (fallbacks) if ACF_BASE_URL is not set
 * - ACF_BASIC_AUTH (optional) base64("username:application_password") or WP user:app password
 * - ACF_TIMEOUT_MS (optional) default 8000
 *
 * Endpoints tried:
 * - /wp-json                 (WordPress presence)
 * - /wp-json/acf/v3          (ACF namespace)
 * - /wp-json/acf/v3/options  (ACF options page)
 * - /wp-json/wp/v2/types     (WP types, useful for capability verification)
 *
 * Captures common rate limit headers if present:
 * - retry-after, x-ratelimit-*
 */

export type AcfAuthMode = 'basic' | 'none';

export interface AcfCheckResult {
  ok: boolean;
  wordpressReachable: boolean;
  acfReachable: boolean;
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
  authModeTried: AcfAuthMode[];
  errors: Array<{ endpoint: string; error: string }>;
  durationMs: number;
  env: {
    baseUrl: 'present' | 'missing';
    basicAuth: 'present' | 'missing';
  };
}

function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  if (v === undefined || v === null || v === '') return fallback;
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
      }
    );
  });
}

function buildHeaders(mode: AcfAuthMode, basicAuth?: string): HeadersInit {
  if (mode === 'basic' && basicAuth) {
    return { Authorization: `Basic ${basicAuth}` };
  }
  return {};
}

function parseRateLimitHeaders(resp: Response) {
  const get = (h: string) => resp.headers.get(h);
  const toNum = (s: string | null): number | undefined => {
    if (!s) return undefined;
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
  mode: AcfAuthMode,
  basicAuth: string | undefined,
  timeoutMs: number
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

export async function checkAcfConnectivity(): Promise<AcfCheckResult> {
  const start = Date.now();

  // Prefer ACF_BASE_URL; fallback to other known WP bases if provided
  const baseUrl =
    getEnv('ACF_BASE_URL') ||
    getEnv('FLUENTCRM_BASE_URL') ||
    getEnv('WOOCOMMERCE_BASE_URL');

  const basicAuth = getEnv('ACF_BASIC_AUTH');
  const timeoutMs = Number(getEnv('ACF_TIMEOUT_MS', '8000'));

  const env = {
    baseUrl: baseUrl ? 'present' as const : 'missing' as const,
    basicAuth: basicAuth ? 'present' as const : 'missing' as const,
  };

  const triedEndpoints: string[] = [];
  const statusCodes: Record<string, number | undefined> = {};
  const errors: Array<{ endpoint: string; error: string }> = [];
  const authModeTried: AcfAuthMode[] = [];

  if (!baseUrl) {
    return {
      ok: false,
      wordpressReachable: false,
      acfReachable: false,
      detectedBase: null,
      triedEndpoints,
      statusCodes,
      rateLimit: undefined,
      authModeTried,
      errors: [{ endpoint: 'config', error: 'ACF_BASE_URL (or fallback) not configured' }],
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

  // 2) Try ACF endpoints
  const paths = ['/wp-json/acf/v3', '/wp-json/acf/v3/options', '/wp-json/wp/v2/types'];
  const modes: AcfAuthMode[] = [
    ...(basicAuth ? (['basic'] as AcfAuthMode[]) : []),
    'none',
  ];

  let acfOk = false;
  let detectedBase: string | null = null;
  let capturedRateLimit: AcfCheckResult['rateLimit'] | undefined;

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
          acfOk = true;
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
    if (acfOk) break;
  }

  const ok = wpOk && (acfOk || !!detectedBase);

  return {
    ok,
    wordpressReachable: wpOk,
    acfReachable: acfOk,
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