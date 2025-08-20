'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, AlertTriangle, CheckCircle2, Info, TimerReset } from 'lucide-react';

type RateLimit = {
  limit?: number;
  remaining?: number;
  reset?: number;
  retryAfterSeconds?: number;
  raw: Record<string, string | null>;
} | null;

type Diagnostics = {
  triedEndpoints: string[];
  statusCodes: Record<string, number | undefined>;
  authModeTried: string[];
  errors: Array<{ endpoint: string; error: string }>;
};

type EnvPresence = {
  FLUENTCRM_BASE_URL: 'present' | 'missing';
  FLUENTCRM_API_KEY: 'present' | 'missing';
  FLUENTCRM_BASIC_AUTH: 'present' | 'missing';
  FLUENTCRM_TIMEOUT_MS: string;
  guidance: string[];
} | undefined;

type Summary = {
  ok: boolean;
  wordpressReachable: boolean;
  fluentCrmReachable: boolean;
  detectedBase: string | null;
  durationMs: number;
};

type ApiResponse = {
  success: boolean;
  summary: Summary;
  rateLimit: RateLimit;
  diagnostics: Diagnostics;
  environment?: EnvPresence;
  timestamp: string;
};

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Badge variant={ok ? 'default' : 'destructive'}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> : <AlertTriangle className="h-3.5 w-3.5 mr-1" />}
      {label}
    </Badge>
  );
}

export default function FluentCrmCheckPage() {
  const [loading, setLoading] = useState(false);
  const [includeEnv, setIncludeEnv] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/crm/fluentcrm/check${includeEnv ? '?includeEnv=true' : ''}`;
      const resp = await fetch(url, { cache: 'no-store' });
      if (!resp.ok) {
        const t = await resp.text();
        throw new Error(t || 'Request failed');
      }
      const json = (await resp.json()) as ApiResponse;
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Failed to run check');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial check
    runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCode = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FluentCRM Connectivity Check</h1>
          <p className="text-sm text-muted-foreground">
            Validate access, discover rate limits, and diagnose endpoint/auth configuration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={includeEnv ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIncludeEnv((v) => !v)}
          >
            <Info className="h-4 w-4 mr-2" />
            {includeEnv ? 'Env: On' : 'Env: Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={runCheck} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Check
          </Button>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Overall connectivity and discovery results</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-red-600">Error: {error}</div>
          )}
          <div className="flex flex-wrap gap-2">
            <StatusBadge ok={!!data?.summary.ok} label="Overall OK" />
            <StatusBadge ok={!!data?.summary.wordpressReachable} label="WordPress Reachable" />
            <StatusBadge ok={!!data?.summary.fluentCrmReachable} label="FluentCRM Reachable" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Detected Base</div>
              <div className="font-medium break-all">
                {data?.summary.detectedBase || '—'}
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="font-medium flex items-center">
                <TimerReset className="h-4 w-4 mr-1" />
                {typeof data?.summary.durationMs === 'number'
                  ? `${data?.summary.durationMs} ms`
                  : '—'}
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Timestamp</div>
              <div className="font-medium">
                {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Discovery</CardTitle>
          <CardDescription>Parsed headers if provided by the server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data?.rateLimit ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">Limit</div>
                  <div className="font-medium">{data.rateLimit.limit ?? '—'}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">Remaining</div>
                  <div className="font-medium">{data.rateLimit.remaining ?? '—'}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">Reset</div>
                  <div className="font-medium">{data.rateLimit.reset ?? '—'}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">Retry-After (s)</div>
                  <div className="font-medium">{data.rateLimit.retryAfterSeconds ?? '—'}</div>
                </div>
              </div>
              <Separator className="my-2" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Raw Headers</div>
                <pre className="text-xs p-3 bg-muted rounded-md overflow-auto">
{formatCode(data.rateLimit.raw)}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No rate limit headers detected.</div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostics</CardTitle>
          <CardDescription>Tried endpoints, status codes, auth modes, and errors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Auth Modes Tried</div>
              <div className="font-medium break-all">
                {data?.diagnostics.authModeTried?.length
                  ? data.diagnostics.authModeTried.join(', ')
                  : '—'}
              </div>
            </div>
            <div className="md:col-span-2 p-3 border rounded-md">
              <div className="text-xs text-muted-foreground">Tried Endpoints</div>
              <div className="text-xs mt-1 space-y-1 max-h-40 overflow-auto">
                {data?.diagnostics.triedEndpoints?.length
                  ? data.diagnostics.triedEndpoints.map((e, i) => (
                      <div key={i} className="font-mono break-all">{e}</div>
                    ))
                  : '—'}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Status Codes</div>
              <pre className="text-xs p-3 bg-muted rounded-md overflow-auto">
{formatCode(data?.diagnostics.statusCodes || {})}
              </pre>
            </div>
            <div className="p-3 border rounded-md">
              <div className="text-xs text-muted-foreground mb-1">Errors</div>
              <pre className="text-xs p-3 bg-muted rounded-md overflow-auto">
{formatCode(data?.diagnostics.errors || [])}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment */}
      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <CardDescription>Presence and guidance for required credentials</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {includeEnv ? (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">FLUENTCRM_BASE_URL</div>
                  <div className="font-medium">{data?.environment?.FLUENTCRM_BASE_URL ?? '—'}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">FLUENTCRM_API_KEY</div>
                  <div className="font-medium">{data?.environment?.FLUENTCRM_API_KEY ?? '—'}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">FLUENTCRM_BASIC_AUTH</div>
                  <div className="font-medium">{data?.environment?.FLUENTCRM_BASIC_AUTH ?? '—'}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground">FLUENTCRM_TIMEOUT_MS</div>
                  <div className="font-medium">{data?.environment?.FLUENTCRM_TIMEOUT_MS ?? '—'}</div>
                </div>
              </div>
              {!!data?.environment?.guidance?.length && (
                <>
                  <Separator className="my-2" />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Guidance</div>
                    <ul className="list-disc pl-5 text-sm">
                      {data.environment.guidance.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Environment detail is hidden. Toggle "Env: Off" to "Env: On" to include presence checks.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}