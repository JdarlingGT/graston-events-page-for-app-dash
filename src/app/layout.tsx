import * as React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '../components/ui/sonner';
import { ThemeProvider } from '../components/theme-provider';
import { ReactQueryProvider } from '../lib/react-query-provider';

// Avoid using next/font/google during CI/build on Windows to prevent spawn
// failures; use CSS variables or fallback fonts instead.
const geistSansVar = '--font-geist-sans';
const geistMonoVar = '--font-geist-mono';

export const metadata: Metadata = {
  title: 'Event Management Dashboard',
  description: 'Comprehensive event management with CRM integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('Rendering RootLayout');
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={'antialiased'}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

// Client-only component to register the service worker on mount. This keeps
// navigator/serviceWorker references out of server/build-time execution.
export function ClientServiceWorkerRegister() {
  'use client';
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}
