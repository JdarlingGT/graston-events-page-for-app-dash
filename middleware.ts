import { NextRequest, NextResponse } from 'next/server';
import {
  annotateHeadersWithRole,
  enforceRoleAccess,
  extractRole,
  isEnforcementEnabled,
  type HttpMethod,
} from '@/lib/auth/rbac';
import { getCorrelationId, generateCorrelationId } from '@/lib/logging';

const PUBLIC_API_PREFIXES: Array<{ prefix: string; methods?: HttpMethod[] }> = [
  // Health and integration checks (read-only)
  { prefix: '/api/notifications/slack/check', methods: ['GET'] },
  { prefix: '/api/crm/fluentcrm/check', methods: ['GET'] },
  { prefix: '/api/analytics/ga4/check', methods: ['GET'] },
  { prefix: '/api/commerce/woocommerce/check', methods: ['GET'] },
  { prefix: '/api/notifications/email/sendgrid/check', methods: ['GET'] },

  // Sales intelligence read endpoints commonly allowed for dashboards (optional, can remove)
  { prefix: '/api/sales/summary', methods: ['GET'] },
  { prefix: '/api/events/check-danger-zone', methods: ['GET'] },
];

function isPublicApi(pathname: string, method: string): boolean {
  for (const entry of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(entry.prefix)) {
      if (!entry.methods || entry.methods.length === 0) return true;
      if (entry.methods.includes(method as HttpMethod)) return true;
    }
  }
  return false;
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = (req.method || 'GET').toUpperCase() as HttpMethod;

  // Generate or honor correlation id and forward it downstream
  const resolvedCorrelationId = getCorrelationId(req.headers) ?? generateCorrelationId();
  const forwardedHeaders = new Headers(req.headers);
  forwardedHeaders.set('x-correlation-id', resolvedCorrelationId);

  // Only guard API routes (matcher below also limits)
  if (!pathname.startsWith('/api/')) {
    // Non-API: still forward correlation id
    const res = NextResponse.next({
      request: {
        headers: forwardedHeaders,
      },
    });
    res.headers.set('x-correlation-id', resolvedCorrelationId);
    return res;
  }

  // Public GET endpoints passthrough (still annotate role + correlation)
  if (isPublicApi(pathname, method)) {
    const role = extractRole(req);
    const res = NextResponse.next({
      request: {
        headers: forwardedHeaders,
      },
    });
    res.headers.set('x-user-role-resolved', role);
    res.headers.set('x-correlation-id', resolvedCorrelationId);
    return res;
  }

  const role = extractRole(req);
  const enforcement = isEnforcementEnabled();

  const decision = enforceRoleAccess(role, pathname, method);

  if (!enforcement) {
    // Enforcement disabled: allow but annotate reason
    const res = NextResponse.next({
      request: {
        headers: forwardedHeaders,
      },
    });
    res.headers.set('x-rbac-enforcement', 'disabled');
    res.headers.set('x-user-role-resolved', role);
    res.headers.set('x-correlation-id', resolvedCorrelationId);
    return res;
  }

  if (!decision.allowed) {
    // Blocked
    const body = {
      error: 'Forbidden',
      role,
      path: pathname,
      method,
      reason: decision.reason || 'Denied',
      matchedPolicy: decision.matchedPolicy || null,
      correlationId: resolvedCorrelationId,
    };
    const res = NextResponse.json(body, { status: 403 });
    res.headers.set('x-rbac-enforcement', 'enabled');
    res.headers.set('x-user-role-resolved', role);
    res.headers.set('x-correlation-id', resolvedCorrelationId);
    return res;
  }

  // Allowed
  const res = NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  });
  res.headers.set('x-rbac-enforcement', 'enabled');
  res.headers.set('x-user-role-resolved', role);
  res.headers.set('x-correlation-id', resolvedCorrelationId);
  return res;
}

export const config = {
  // Apply to all API routes, excluding Next internals and static assets
  matcher: ['/api/:path*'],
};