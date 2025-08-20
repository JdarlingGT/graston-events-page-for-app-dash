/**
 * WooCommerce REST API connectivity + rate limit discovery
 *
 * Environment variables:
 * - WOOCOMMERCE_BASE_URL (required) e.g. https://example.com
 * - WOOCOMMERCE_CONSUMER_KEY (optional) ck_xxx
 * - WOOCOMMERCE_CONSUMER_SECRET (optional) cs_xxx
 * - WOOCOMMERCE_BASIC_AUTH (optional) base64("ck_xxx:cs_xxx") or WP user:app password
 * - WOOCOMMERCE_TIMEOUT_MS (optional) default 8000
 *
 * Authentication strategies tried:
 * - Query string consumer_key/consumer_secret (recommended for server-to-server over HTTPS)
 * - Basic auth (Authorization: Basic base64)
 * - No auth (for open endpoints or CORS ping)
 *
 * Endpoints tried:
 * - /wp-json                (WordPress presence)
 * - /wp-json/wc/v3          (WooCommerce namespace)
 * - /wp-json/wc/v3/system_status
 * - /wp-json/wc/v3/products?per_page=1
 *
 * Captures common rate limit headers if present:
 * - retry-after, x-ratelimit-*
 */

export type WooAuthMode = 'query' | 'basic' | 'none';

export interface WooCheckResult {
  ok: boolean;
  wordpressReachable: boolean;
  woocommerceReachable: boolean;
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
  authModeTried: WooAuthMode[];
  errors: Array<{ endpoint: string; error: string }>;
  durationMs: number;
  env: {
    baseUrl: 'present' | 'missing';
    consumerKey: 'present' | 'missing';
    consumerSecret: 'present' | 'missing';
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

function buildHeaders(mode: WooAuthMode, basicAuth?: string): HeadersInit {
  if (mode === 'basic' && basicAuth) {
    return { Authorization: `Basic ${basicAuth}` };
  }
  return {};
}

function buildUrl(
  base: string,
  path: string,
  mode: WooAuthMode,
  ck?: string,
  cs?: string
): string {
  const u = new URL(path, base);
  if (mode === 'query' && ck && cs) {
    u.searchParams.set('consumer_key', ck);
    u.searchParams.set('consumer_secret', cs);
  }
  return u.toString();
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
  url: string,
  mode: WooAuthMode,
  base: string,
  ck: string | undefined,
  cs: string | undefined,
  basicAuth: string | undefined,
  timeoutMs: number
): Promise<{ endpoint: string; response?: Response; error?: Error }> {
  const endpoint = buildUrl(base, url, mode, ck, cs);
  const headers = buildHeaders(mode, basicAuth);

  try {
    const response = await withTimeout(fetch(endpoint, { headers }), timeoutMs);
    return { endpoint, response };
  } catch (error: any) {
    return { endpoint, error };
  }
}

export async function checkWooCommerceConnectivity(): Promise<WooCheckResult> {
  const start = Date.now();

  const baseUrl = getEnv('WOOCOMMERCE_BASE_URL');
  const ck = getEnv('WOOCOMMERCE_CONSUMER_KEY');
  const cs = getEnv('WOOCOMMERCE_CONSUMER_SECRET');
  const basicAuth = getEnv('WOOCOMMERCE_BASIC_AUTH');
  const timeoutMs = Number(getEnv('WOOCOMMERCE_TIMEOUT_MS', '8000'));

  const env = {
    baseUrl: baseUrl ? 'present' as const : 'missing' as const,
    consumerKey: ck ? 'present' as const : 'missing' as const,
    consumerSecret: cs ? 'present' as const : 'missing' as const,
    basicAuth: basicAuth ? 'present' as const : 'missing' as const,
  };

  const triedEndpoints: string[] = [];
  const statusCodes: Record<string, number | undefined> = {};
  const errors: Array<{ endpoint: string; error: string }> = [];
  const authModeTried: WooAuthMode[] = [];

  if (!baseUrl) {
    return {
      ok: false,
      wordpressReachable: false,
      woocommerceReachable: false,
      detectedBase: null,
      triedEndpoints,
      statusCodes,
      rateLimit: undefined,
      authModeTried,
      errors: [{ endpoint: 'config', error: 'WOOCOMMERCE_BASE_URL not configured' }],
      durationMs: Date.now() - start,
      env,
    };
  }

  // 1) Check WordPress root
  let wpOk = false;
  {
    const r = await tryFetch('/wp-json', 'none', baseUrl, ck, cs, basicAuth, timeoutMs);
    triedEndpoints.push(r.endpoint);
    if (r.response) {
      statusCodes[r.endpoint] = r.response.status;
      wpOk = r.response.ok;
    } else if (r.error) {
      errors.push({ endpoint: r.endpoint, error: r.error.message });
    }
  }

  // 2) Try Woo endpoints with different auth modes
  const wooPaths = [
    '/wp-json/wc/v3',
    '/wp-json/wc/v3/system_status',
    '/wp-json/wc/v3/products?per_page=1',
  ];

  const modes: WooAuthMode[] = [
    ...(ck && cs ? (['query'] as WooAuthMode[]) : []),
    ...(basicAuth ? (['basic'] as WooAuthMode[]) : []),
    'none',
  ];

  let wooOk = false;
  let detectedBase: string | null = null;
  let capturedRateLimit: WooCheckResult['rateLimit'] | undefined;

  for (const path of wooPaths) {
    for (const mode of modes) {
      authModeTried.push(mode);

      const r = await tryFetch(path, mode, baseUrl, ck, cs, basicAuth, timeoutMs);
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
          wooOk = true;
          detectedBase = r.endpoint.replace(/\/wp-json\/wc\/v3.*/, '/wp-json/wc/v3');
          break;
        }

        // Non-OK statuses still indicate reachability
        if (!detectedBase && (r.response.status === 401 || r.response.status === 403 || r.response.status === 404)) {
          detectedBase = r.endpoint.replace(/\/wp-json\/wc\/v3.*/, '/wp-json/wc/v3');
        }
      } else if (r.error) {
        errors.push({ endpoint: `${r.endpoint} [${mode}]`, error: r.error.message });
      }
    }
    if (wooOk) break;
  }

  const ok = wpOk && (wooOk || !!detectedBase);

  return {
    ok,
    wordpressReachable: wpOk,
    woocommerceReachable: wooOk,
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