import Sidebar from '../../components/dashboard/sidebar';
import Header from '../../components/dashboard/header';
import { DashboardBreadcrumbs } from '@/components/dashboard/breadcrumbs';
import { CommandPalette } from '@/components/dashboard/command-palette';
import { CommandPaletteProvider } from '@/hooks/use-command-palette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CommandPaletteProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
          <Header />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <DashboardBreadcrumbs />
            {children}
          </main>
        </div>
        <CommandPalette />
      </div>
    </CommandPaletteProvider>
  );
}