/**
 * GA4 Measurement Protocol (MP) Debug connectivity check
 *
 * Environment variables:
 * - GA4_MEASUREMENT_ID (required) e.g. G-XXXXXXXXXX
 * - GA4_API_SECRET (required) from GA4 data streams
 * - GA4_DEBUG_CLIENT_ID (optional) stable client id for debug; defaults to a generated one
 * - GA4_TIMEOUT_MS (optional) request timeout in ms (default 8000)
 *
 * This uses the MP Debug endpoint so events are validated but not recorded.
 * See: https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events
 */

export interface Ga4CheckResult {
  ok: boolean;
  httpStatus?: number;
  endpoint: string;
  validationMessages?: Array<{
    fieldPath?: string;
    description?: string;
    validationCode?: string;
  }>;
  errors: string[];
  durationMs: number;
  requestId: string;
  env: {
    measurementId: 'present' | 'missing';
    apiSecret: 'present' | 'missing';
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

function buildClientId(): string {
  const fromEnv = getEnv('GA4_DEBUG_CLIENT_ID');
  if (fromEnv) return fromEnv;
  // Simple pseudo client id
  return `${Date.now()}.${Math.floor(Math.random() * 1_000_000_000)}`;
}

export async function checkGa4Connectivity(): Promise<Ga4CheckResult> {
  const start = Date.now();
  const reqId = `ga4_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const measurementId = getEnv('GA4_MEASUREMENT_ID');
  const apiSecret = getEnv('GA4_API_SECRET');
  const timeoutMs = Number(getEnv('GA4_TIMEOUT_MS', '8000'));

  const endpointBase = 'https://www.google-analytics.com/debug/mp/collect';
  const endpoint = `${endpointBase}?measurement_id=${encodeURIComponent(
    measurementId || ''
  )}&api_secret=${encodeURIComponent(apiSecret || '')}`;

  // Env presence pre-check
  const envPresence = {
    measurementId: measurementId ? 'present' as const : 'missing' as const,
    apiSecret: apiSecret ? 'present' as const : 'missing' as const,
  };

  if (!measurementId || !apiSecret) {
    return {
      ok: false,
      httpStatus: undefined,
      endpoint,
      validationMessages: undefined,
      errors: [
        !measurementId ? 'GA4_MEASUREMENT_ID is missing' : '',
        !apiSecret ? 'GA4_API_SECRET is missing' : '',
      ].filter(Boolean),
      durationMs: Date.now() - start,
      requestId: reqId,
      env: envPresence,
    };
  }

  // Minimal debug payload per GA4 MP
  const body = {
    client_id: buildClientId(),
    // For debugging only; this is not recorded since we use debug endpoint
    events: [
      {
        name: 'connectivity_check',
        params: {
          engagement_time_msec: '1',
          request_id: reqId,
        },
      },
    ],
    // Optionally: timestamp_micros: String(Date.now() * 1000),
  };

  try {
    const resp = await withTimeout(
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      timeoutMs
    );

    const httpStatus = resp.status;
    let json: any = null;
    try {
      json = await resp.json();
    } catch {
      // some proxies may block; still return status info
    }

    // Per GA4 docs, validationMessages may be empty array when OK
    const validationMessages: Array<{
      fieldPath?: string;
      description?: string;
      validationCode?: string;
    }> | undefined = json?.validationMessages;

    // OK criteria: HTTP 200 and no error-level validation messages
    const hasErrors =
      Array.isArray(validationMessages) &&
      validationMessages.some(
        (m) =>
          String(m.validationCode || '').toUpperCase().includes('ERROR') ||
          String(m.description || '').toLowerCase().includes('error')
      );

    const ok = resp.ok && !hasErrors;

    return {
      ok,
      httpStatus,
      endpoint,
      validationMessages,
      errors: ok
        ? []
        : [
            `HTTP ${httpStatus}`,
            ...(Array.isArray(validationMessages)
              ? validationMessages.map(
                  (m) =>
                    `${m.validationCode || 'MSG'}: ${m.description || ''}${
                      m.fieldPath ? ` (${m.fieldPath})` : ''
                    }`
                )
              : []),
          ].filter(Boolean),
      durationMs: Date.now() - start,
      requestId: reqId,
      env: envPresence,
    };
  } catch (err: any) {
    return {
      ok: false,
      httpStatus: undefined,
      endpoint,
      validationMessages: undefined,
      errors: [err?.message || 'Network error'],
      durationMs: Date.now() - start,
      requestId: reqId,
      env: envPresence,
    };
  }
}