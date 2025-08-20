/**
 * FluentCRM integration utilities
 * Reads configuration from environment variables and attempts connectivity checks.
 *
 * Supported environment variables:
 * - FLUENTCRM_BASE_URL (required): e.g. https://example.com
 * - FLUENTCRM_API_KEY (optional): API key for bearer or X-API-Key auth
 * - FLUENTCRM_BASIC_AUTH (optional): base64 encoded "username:password" for Basic auth
 * - FLUENTCRM_TIMEOUT_MS (optional): request timeout in ms (default 8000)
 *
 * This client tries multiple potential FluentCRM REST routes since installs may differ:
 * - /wp-json/fluent-crm/v2
 * - /wp-json/fluentcrm/v2
 * It also validates WordPress reachability via /wp-json.
 */

export type FluentCrmAuthMode =
  | 'bearer'
  | 'x-api-key'
  | 'basic'
  | 'query-api-key'
  | 'none';

export interface FluentCrmCheckResult {
  ok: boolean;
  wordpressReachable: boolean;
  fluentCrmReachable: boolean;
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
  authModeTried: FluentCrmAuthMode[];
  errors: Array<{ endpoint: string; error: string }>;
  durationMs: number;
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

function buildAuthHeaders(
  mode: FluentCrmAuthMode,
  apiKey?: string,
  basicAuth?: string
): HeadersInit {
  switch (mode) {
    case 'bearer':
      return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    case 'x-api-key':
      return apiKey ? { 'X-API-Key': apiKey } : {};
    case 'basic':
      return basicAuth ? { Authorization: `Basic ${basicAuth}` } : {};
    case 'none':
    case 'query-api-key':
    default:
      return {};
  }
}

function appendQueryApiKey(url: string, mode: FluentCrmAuthMode, apiKey?: string): string {
  if (mode !== 'query-api-key' || !apiKey) return url;
  const u = new URL(url);
  u.searchParams.set('api_key', apiKey);
  return u.toString();
}

function extractRateLimitHeaders(resp: Response): FluentCrmCheckResult['rateLimit'] {
  const getHeader = (h: string) => resp.headers.get(h);

  const limitStr = getHeader('x-ratelimit-limit');
  const remainingStr = getHeader('x-ratelimit-remaining');
  const resetStr = getHeader('x-ratelimit-reset');
  const retryAfterStr = getHeader('retry-after');

  const toNum = (s: string | null): number | undefined => {
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

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
  mode: FluentCrmAuthMode,
  apiKey: string | undefined,
  basicAuth: string | undefined,
  timeoutMs: number
): Promise<{ response?: Response; error?: Error }> {
  const authHeaders = buildAuthHeaders(mode, apiKey, basicAuth);
  const finalUrl = appendQueryApiKey(url, mode, apiKey);

  try {
    const response = await withTimeout(
      fetch(finalUrl, { headers: { ...authHeaders } }),
      timeoutMs
    );
    return { response };
  } catch (error: any) {
    return { error };
  }
}

export async function checkFluentCrmConnectivity(): Promise<FluentCrmCheckResult> {
  const start = Date.now();

  const baseUrl = getEnv('FLUENTCRM_BASE_URL');
  const apiKey = getEnv('FLUENTCRM_API_KEY');
  const basicAuth = getEnv('FLUENTCRM_BASIC_AUTH');
  const timeoutMs = Number(getEnv('FLUENTCRM_TIMEOUT_MS', '8000'));

  const triedEndpoints: string[] = [];
  const statusCodes: Record<string, number | undefined> = {};
  const errors: Array<{ endpoint: string; error: string }> = [];
  const authModesToTry: FluentCrmAuthMode[] = [
    'bearer',
    'x-api-key',
    'basic',
    'query-api-key',
    'none',
  ];
  const authModeTried: FluentCrmAuthMode[] = [];

  if (!baseUrl) {
    return {
      ok: false,
      wordpressReachable: false,
      fluentCrmReachable: false,
      detectedBase: null,
      triedEndpoints,
      statusCodes,
      rateLimit: undefined,
      authModeTried,
      errors: [{ endpoint: 'config', error: 'FLUENTCRM_BASE_URL not configured' }],
      durationMs: Date.now() - start,
    };
  }

  // 1) Check WordPress root /wp-json
  const wpJson = new URL('/wp-json', baseUrl).toString();
  triedEndpoints.push(wpJson);
  let wpOk = false;

  {
    const { response, error } = await tryFetch(wpJson, 'none', apiKey, basicAuth, timeoutMs);
    if (response) {
      statusCodes[wpJson] = response.status;
      wpOk = response.ok;
    } else if (error) {
      errors.push({ endpoint: wpJson, error: error.message });
    }
  }

  // 2) Try FluentCRM variants
  const fluentVariants = [
    '/wp-json/fluent-crm/v2/settings',
    '/wp-json/fluentcrm/v2/settings',
    '/wp-json/fluent-crm/v2/tags',
    '/wp-json/fluentcrm/v2/tags',
  ];

  let fluentOk = false;
  let detectedBase: string | null = null;
  let capturedRateLimit: FluentCrmCheckResult['rateLimit'] | undefined;

  for (const variant of fluentVariants) {
    const endpoint = new URL(variant, baseUrl).toString();

    // Try across auth modes until one yields 2xx/401/403 (anything but network error/timeouts)
    for (const mode of authModesToTry) {
      // Avoid trying API-key modes without key
      if ((mode === 'bearer' || mode === 'x-api-key' || mode === 'query-api-key') && !apiKey) {
        continue;
      }
      if (mode === 'basic' && !basicAuth) {
        continue;
      }

      authModeTried.push(mode);
      triedEndpoints.push(`${endpoint} [${mode}]`);

      const { response, error } = await tryFetch(endpoint, mode, apiKey, basicAuth, timeoutMs);

      if (response) {
        statusCodes[`${endpoint} [${mode}]`] = response.status;

        // Capture rate limit headers if present
        const rate = extractRateLimitHeaders(response);
        if (
          rate?.limit !== undefined ||
          rate?.remaining !== undefined ||
          rate?.retryAfterSeconds !== undefined
        ) {
          capturedRateLimit = rate;
        }

        if (response.ok) {
          fluentOk = true;
          detectedBase = endpoint.replace(/\/(settings|tags).*$/, '');
          // Stop after first confirmed success
          break;
        }

        // If unauthorized/forbidden, we still got a valid response; continue trying other auth modes
        // 401/403 indicates the endpoint exists but credentials may be wrong
        if (response.status === 401 || response.status === 403) {
          detectedBase = endpoint.replace(/\/(settings|tags).*$/, '');
          // Keep trying other auth modes
          continue;
        }

        // Other non-2xx statuses: continue variants
      } else if (error) {
        errors.push({ endpoint: `${endpoint} [${mode}]`, error: error.message });
        // Try next auth mode/variant
        continue;
      }
    }

    if (fluentOk) break;
  }

  const ok = wpOk && (fluentOk || !!detectedBase);

  return {
    ok,
    wordpressReachable: wpOk,
    fluentCrmReachable: fluentOk,
    detectedBase,
    triedEndpoints,
    statusCodes,
    rateLimit: capturedRateLimit,
    authModeTried,
    errors,
    durationMs: Date.now() - start,
  };
}