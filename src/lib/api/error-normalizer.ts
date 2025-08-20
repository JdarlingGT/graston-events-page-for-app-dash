import { NextResponse } from 'next/server';
import { getCorrelationId, generateCorrelationId, logger } from '@/lib/logging';

/**
 * Standardized API error shape
 */
export interface NormalizedErrorBody {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status ?? 500;
    this.code = options?.code ?? 'INTERNAL_ERROR';
    this.details = options?.details;
  }
}

/**
 * Create an ApiError with convenience defaults
 */
export function createApiError(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown,
) {
  return new ApiError(message, { status, code, details });
}

/**
 * Convert an unknown exception into a normalized ApiError + response body
 */
export function normalizeUnknownError(err: unknown): ApiError {
  if (err instanceof ApiError) {
return err;
}

  // Handle common error shapes
  if (typeof err === 'object' && err && 'message' in err) {
    const anyErr = err as any;
    const message = String(anyErr.message ?? 'Unexpected error');
    // Preserve HTTP-like status if present
    const status = Number(anyErr.status ?? anyErr.statusCode ?? 500);
    const code = String(anyErr.code ?? 'INTERNAL_ERROR');
    const details =
      anyErr.details ??
      (anyErr.stack
        ? {
            stack: String(anyErr.stack).split('\n').slice(0, 5), // include a trimmed stack for debugging (server logs will have full stack)
          }
        : undefined);

    return new ApiError(message, {
      status: Number.isFinite(status) ? status : 500,
      code,
      details,
    });
  }

  // Fallback
  return new ApiError('Unexpected error', { status: 500, code: 'INTERNAL_ERROR' });
}

/**
 * Attempt to extract useful details from a ZodError without importing zod
 */
function extractZodDetails(maybeZodErr: unknown): unknown {
  const e: any = maybeZodErr;
  if (e && typeof e === 'object' && Array.isArray(e.issues)) {
    try {
      return e.issues.map((i: any) => ({
        path: Array.isArray(i.path) ? i.path.join('.') : i.path,
        message: String(i.message ?? ''),
        code: String(i.code ?? ''),
      }));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Build a NextResponse JSON with standardized shape and correlation id
 */
export function errorResponse(
  err: unknown,
  reqHeaders?: Headers,
): NextResponse<NormalizedErrorBody> {
  const apiErr = normalizeUnknownError(err);

  // If it appears to be a ZodError, surface better details
  if (!apiErr.details) {
    const zod = extractZodDetails(err);
    if (zod) {
      apiErr.details = { validation: zod };
      if (apiErr.status === 500) {
        apiErr.status = 400;
        apiErr.code = 'VALIDATION_ERROR';
      }
    }
  }

  const cid = getCorrelationId(reqHeaders) ?? generateCorrelationId();

  // Server-side structured log
  logger.error(apiErr.message, {
    correlationId: cid,
    context: 'api',
    status: apiErr.status,
    code: apiErr.code,
    details: apiErr.details,
  });

  const body: NormalizedErrorBody = {
    error: {
      code: apiErr.code,
      message: apiErr.message,
      correlationId: cid,
      details: apiErr.details,
    },
  };

  return NextResponse.json(body, {
    status: apiErr.status,
    headers: {
      'x-correlation-id': cid,
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/**
 * withApiHandler - Wrap a route handler with standardized error normalization.
 *
 * Usage (in route.ts):
 *   import { withApiHandler } from '@/lib/api/error-normalizer';
 *
 *   export const GET = withApiHandler(async (req) => {
 *     // ... your logic
 *     return NextResponse.json({ ok: true });
 *   });
 */
export function withApiHandler<T extends (req: Request) => Promise<NextResponse> | NextResponse>(
  handler: T,
) {
  return (async function wrapped(req: Request) {
    try {
      const res = await handler(req);
      return res;
    } catch (err) {
      return errorResponse(err, req.headers as Headers);
    }
  }) as T;
}

/**
 * Helper for asserting required env vars in APIs
 */
export function requireEnv(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v] || process.env[v] === '');
  if (missing.length) {
    throw createApiError(
      'ENV_MISSING',
      `Missing required environment variable(s): ${missing.join(', ')}`,
      500,
    );
  }
}