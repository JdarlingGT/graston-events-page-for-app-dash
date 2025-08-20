import { NextRequest, NextResponse } from 'next/server';
import { checkSendGridConnectivity } from '@/lib/integrations/sendgrid';

/**
 * GET /api/notifications/email/sendgrid/check
 * Validates SendGrid connectivity and returns diagnostics + rate-limit headers when present.
 */
export async function GET(_request: NextRequest) {
  try {
    const result = await checkSendGridConnectivity();

    return NextResponse.json(
      {
        success: true,
        summary: {
          ok: result.ok,
          authPresent: result.authPresent,
          durationMs: result.durationMs,
          requestId: result.requestId,
        },
        endpoints: result.endpoints,
        rateLimit: result.rateLimit ?? null,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (err) {
    console.error('SendGrid connectivity check error:', err);
    return NextResponse.json(
      { success: false, error: 'SendGrid connectivity check failed' },
      { status: 500 },
    );
  }
}