'use client';

import { useEffect } from 'react';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Best-effort client-side log for visibility. Server logs will carry correlation IDs.
    // eslint-disable-next-line no-console
    console.error('App Error Boundary:', { message: error?.message, digest: error?.digest });
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="max-w-md w-full border rounded-lg p-6 shadow-sm bg-white">
        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600">
          An unexpected error occurred while rendering this page. You can try again, or return later.
        </p>

        {error?.digest && (
          <div className="mt-3 text-xs text-gray-500">
            Reference Code: <span className="font-mono">{error.digest}</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Go home
          </a>
        </div>

        <details className="mt-6 text-xs text-gray-500 whitespace-pre-wrap">
          <summary className="cursor-pointer">Technical details</summary>
          {error?.message || 'No additional details'}
        </details>
      </div>
    </div>
  );
}