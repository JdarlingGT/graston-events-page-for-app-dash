import { NextRequest, NextResponse } from 'next/server';
import { checkFluentCrmConnectivity } from '@/lib/integrations/fluentcrm';

function envPresence() {
  const hasBase = !!process.env.FLUENTCRM_BASE_URL;
  const hasApiKey = !!process.env.FLUENTCRM_API_KEY;
  const hasBasic = !!process.env.FLUENTCRM_BASIC_AUTH;
  const timeout = process.env.FLUENTCRM_TIMEOUT_MS || '8000';

  return {
    FLUENTCRM_BASE_URL: hasBase ? 'present' : 'missing',
    FLUENTCRM_API_KEY: hasApiKey ? 'present' : 'missing',
    FLUENTCRM_BASIC_AUTH: hasBasic ? 'present' : 'missing',
    FLUENTCRM_TIMEOUT_MS: timeout,
    guidance: [
      !hasBase ? 'Set FLUENTCRM_BASE_URL to your WordPress site base URL, e.g. https://example.com' : null,
      !hasApiKey && !hasBasic ? 'Provide either FLUENTCRM_API_KEY or FLUENTCRM_BASIC_AUTH (base64 of username:password)' : null,
    ].filter(Boolean),
  };
}

/**
 * GET /api/crm/fluentcrm/check
 * Performs a connectivity + rate-limit header discovery against FluentCRM REST endpoints.
 * Optional query:
 *  - includeEnv=true to return presence of required env vars
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const includeEnv = url.searchParams.get('includeEnv') === 'true';

    const result = await checkFluentCrmConnectivity();

    return NextResponse.json(
      {
        success: true,
        summary: {
          ok: result.ok,
          wordpressReachable: result.wordpressReachable,
          fluentCrmReachable: result.fluentCrmReachable,
          detectedBase: result.detectedBase,
          durationMs: result.durationMs,
        },
        rateLimit: result.rateLimit || null,
        diagnostics: {
          triedEndpoints: result.triedEndpoints,
          statusCodes: result.statusCodes,
          authModeTried: result.authModeTried,
          errors: result.errors,
        },
        environment: includeEnv ? envPresence() : undefined,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('FluentCRM connectivity check error:', err);
    return NextResponse.json(
      { success: false, error: 'FluentCRM connectivity check failed' },
      { status: 500 }
    );
  }
}