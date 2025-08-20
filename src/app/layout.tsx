import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '../components/ui/sonner';
import { ThemeProvider } from '../components/theme-provider';
import { ReactQueryProvider } from '../lib/react-query-provider';

export const metadata: Metadata = {
  title: 'Event Management Dashboard',
  description: 'Comprehensive event management with CRM integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
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