import { cn } from '@/lib/utils';

export function BrandedLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <span className="sr-only">Loading...</span>
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
    </div>
  );
}