/**
 * Simple RBAC (Role-Based Access Control) utilities
 *
 * How roles are detected (priority order):
 *  1) X-User-Role header (e.g., 'admin', 'coordinator', 'instructor', 'sales', 'marketing', 'accounting')
 *  2) Cookie 'role'
 *  3) Falls back to 'guest'
 *
 * How enforcement is toggled:
 *  - RBAC_ENFORCEMENT=true (default) enforces policy
 *  - RBAC_ENFORCEMENT=false disables blocking (but still annotates request via headers)
 *
 * Route policy is defined using simple glob-like prefix matching against request pathname.
 * Methods can be restricted per route scope if needed.
 */

export type Role =
  | 'admin'
  | 'coordinator'
  | 'instructor'
  | 'sales'
  | 'marketing'
  | 'accounting'
  | 'guest';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface RoutePolicy {
  prefix: string; // e.g. '/api/marketing/'
  methods?: HttpMethod[]; // optional restriction; empty = all methods
}

export interface RolePolicy {
  allow: RoutePolicy[];
  deny?: RoutePolicy[];
}

export interface EnforcementResult {
  allowed: boolean;
  reason?: string;
  matchedPolicy?: RoutePolicy | null;
}

/**
 * Central policy table by role
 * Prefix rules are matched from most specific (longest) to least specific.
 */
const POLICY: Record<Role, RolePolicy> = {
  admin: {
    allow: [{ prefix: '/' }],
  },

  coordinator: {
    allow: [
      { prefix: '/api/events/' },
      { prefix: '/api/instructors/' },
      { prefix: '/api/trainings/' },
      { prefix: '/api/students/' },
      { prefix: '/api/venues/' },
      { prefix: '/api/notifications/' },
      // Read-only analytics allowed
      { prefix: '/api/sales/', methods: ['GET'] },
      { prefix: '/api/marketing/', methods: ['GET'] },
      { prefix: '/api/analytics/', methods: ['GET'] },
    ],
    deny: [
      // Block destructive actions in sales/marketing
      { prefix: '/api/sales/', methods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
      { prefix: '/api/marketing/', methods: ['POST', 'PUT', 'PATCH', 'DELETE'] },
    ],
  },

  instructor: {
    allow: [
      { prefix: '/api/trainings/' },
      { prefix: '/api/events/[id]/checkin/' },
      { prefix: '/api/events/[id]/attendees/' },
      { prefix: '/api/instructors/' },
      // Read-only visibility for their events
      { prefix: '/api/events/', methods: ['GET'] },
    ],
    deny: [
      { prefix: '/api/marketing/' },
      { prefix: '/api/sales/' },
      { prefix: '/api/analytics/' },
      { prefix: '/api/accounting/' },
    ],
  },

  sales: {
    allow: [
      { prefix: '/api/sales/' },
      { prefix: '/api/crm/' },
      { prefix: '/api/marketing/funnel-data/' }, // read marketing funnel
      { prefix: '/api/analytics/' }, // GA4 checks etc.
      { prefix: '/api/events/', methods: ['GET'] },
    ],
    deny: [
      { prefix: '/api/accounting/' },
    ],
  },

  marketing: {
    allow: [
      { prefix: '/api/marketing/' },
      { prefix: '/api/sales/outreach/' }, // outreach templates + generation
      { prefix: '/api/analytics/' },
      { prefix: '/api/commerce/woocommerce/check/' }, // checks for attribution integrations
      { prefix: '/api/crm/fluentcrm/check/' },
      { prefix: '/api/events/', methods: ['GET'] },
    ],
    deny: [
      { prefix: '/api/accounting/' },
    ],
  },

  accounting: {
    allow: [
      { prefix: '/api/accounting/' },
      { prefix: '/api/events/', methods: ['GET'] },
      { prefix: '/api/sales/summary/', methods: ['GET'] },
    ],
    deny: [
      { prefix: '/api/marketing/' },
      { prefix: '/api/sales/outreach/' },
    ],
  },

  guest: {
    allow: [
      // Allow public GETs only for limited endpoints if desired; default none.
      // Add entries like { prefix: '/api/events/', methods: ['GET'] } to expose public listings.
    ],
  },
};

/**
 * True if enforcement is enabled
 */
export function isEnforcementEnabled(): boolean {
  const flag = (process.env.RBAC_ENFORCEMENT ?? 'true').toLowerCase();
  return flag !== 'false' && flag !== '0' && flag !== 'no';
}

/**
 * Extract role from Request headers/cookies
 */
export function extractRole(req: Request): Role {
  // 1) Header takes precedence
  const headerRole = req.headers.get('x-user-role');
  if (headerRole && isValidRole(headerRole)) {
    return headerRole as Role;
  }

  // 2) Cookie fallback
  const cookie = req.headers.get('cookie') || '';
  const match = /(?:^|;\s*)role=([^;]+)/i.exec(cookie);
  if (match?.[1] && isValidRole(decodeURIComponent(match[1]))) {
    return decodeURIComponent(match[1]) as Role;
  }

  // 3) Fallback
  return 'guest';
}

function isValidRole(val: string): val is Role {
  return ['admin', 'coordinator', 'instructor', 'sales', 'marketing', 'accounting', 'guest'].includes(
    val.toLowerCase()
  );
}

/**
 * Match a request against a policy list
 */
function matchPolicy(
  list: RoutePolicy[] | undefined,
  pathname: string,
  method: HttpMethod
): RoutePolicy | null {
  if (!list || list.length === 0) return null;

  // Sort by longest prefix to match the most specific first
  const sorted = [...list].sort((a, b) => b.prefix.length - a.prefix.length);

  for (const policy of sorted) {
    if (pathname.startsWith(policy.prefix)) {
      if (!policy.methods || policy.methods.length === 0) {
        return policy;
      }
      if (policy.methods.includes(method)) {
        return policy;
      }
    }
  }
  return null;
}

/**
 * Decide if a role is allowed for a given request path/method
 */
export function enforceRoleAccess(
  role: Role,
  pathname: string,
  method: HttpMethod
): EnforcementResult {
  // Admin short-circuit
  if (role === 'admin') {
    return { allowed: true, matchedPolicy: { prefix: '/', methods: [] } };
  }

  const policy = POLICY[role] ?? POLICY['guest'];

  // Explicit deny takes precedence if matched
  const denyHit = matchPolicy(policy.deny, pathname, method);
  if (denyHit) {
    return { allowed: false, reason: 'Denied by role policy', matchedPolicy: denyHit };
  }

  // Then allow-list
  const allowHit = matchPolicy(policy.allow, pathname, method);
  if (allowHit) {
    return { allowed: true, matchedPolicy: allowHit };
  }

  // No match = deny
  return { allowed: false, reason: 'No matching allow policy', matchedPolicy: null };
}

/**
 * Utility to decorate a request with role info via headers (non-standard)
 * Can be used in Middleware to forward role info downstream without re-parsing.
 */
export function annotateHeadersWithRole(headers: Headers, role: Role): Headers {
  const next = new Headers(headers);
  next.set('x-user-role-resolved', role);
  return next;
}