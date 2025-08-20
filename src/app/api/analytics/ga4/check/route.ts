import { NextRequest, NextResponse } from 'next/server';
import { checkGa4Connectivity } from '@/lib/integrations/ga4';

/**
 * GET /api/analytics/ga4/check
 * Validates GA4 Measurement Protocol (debug) connectivity and returns diagnostics.
 */
export async function GET(_request: NextRequest) {
  try {
    const result = await checkGa4Connectivity();

    return NextResponse.json(
      {
        success: true,
        summary: {
          ok: result.ok,
          httpStatus: result.httpStatus ?? null,
          endpoint: result.endpoint,
          durationMs: result.durationMs,
          requestId: result.requestId,
        },
        validationMessages: result.validationMessages ?? [],
        errors: result.errors,
        envPresence: result.env,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (err) {
    console.error('GA4 connectivity check error:', err);
    return NextResponse.json(
      { success: false, error: 'GA4 connectivity check failed' },
      { status: 500 },
    );
  }
}