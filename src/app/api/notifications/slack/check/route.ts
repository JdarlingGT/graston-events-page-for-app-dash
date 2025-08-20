import { NextRequest, NextResponse } from 'next/server';
import { checkSlackWebhookConnectivity } from '@/lib/integrations/slack';

/**
 * GET /api/notifications/slack/check
 * Validates Slack Webhook connectivity and returns diagnostics + rate-limit headers when present.
 */
export async function GET(_request: NextRequest) {
  try {
    const result = await checkSlackWebhookConnectivity();

    return NextResponse.json(
      {
        success: true,
        summary: {
          ok: result.ok,
          httpStatus: result.httpStatus ?? null,
          durationMs: result.durationMs,
          requestId: result.requestId,
          endpoint: result.endpoint,
        },
        rateLimit: result.rateLimit ?? null,
        envPresence: result.env,
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
    console.error('Slack connectivity check error:', err);
    return NextResponse.json(
      { success: false, error: 'Slack connectivity check failed' },
      { status: 500 },
    );
  }
}