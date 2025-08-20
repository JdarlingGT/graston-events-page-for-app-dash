import { NextRequest, NextResponse } from 'next/server';
import { checkWooCommerceConnectivity } from '@/lib/integrations/woocommerce';

/**
 * GET /api/commerce/woocommerce/check
 * Validates WooCommerce REST connectivity and returns diagnostics + rate-limit headers when present.
 */
export async function GET(_request: NextRequest) {
  try {
    const result = await checkWooCommerceConnectivity();

    return NextResponse.json(
      {
        success: true,
        summary: {
          ok: result.ok,
          wordpressReachable: result.wordpressReachable,
          woocommerceReachable: result.woocommerceReachable,
          detectedBase: result.detectedBase,
          durationMs: result.durationMs,
        },
        rateLimit: result.rateLimit ?? null,
        diagnostics: {
          triedEndpoints: result.triedEndpoints,
          statusCodes: result.statusCodes,
          authModeTried: result.authModeTried,
          errors: result.errors,
        },
        envPresence: result.env,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('WooCommerce connectivity check error:', err);
    return NextResponse.json(
      { success: false, error: 'WooCommerce connectivity check failed' },
      { status: 500 }
    );
  }
}