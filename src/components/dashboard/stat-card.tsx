import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  changeDescription?: string;
}

export function StatCard({ title, value, icon: Icon, change, changeDescription }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground">
            <span
              className={cn(
                'flex items-center gap-1',
                change >= 0 ? 'text-green-600' : 'text-red-600',
              )}
            >
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change.toFixed(1)}%
            </span>
            {changeDescription && <span className="ml-1">{changeDescription}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}