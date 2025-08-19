'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BarChart } from 'lucide-react';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import Link from 'next/link';

interface UtmSource {
  source: string;
  revenue: number;
}

async function fetchTopSources(): Promise<UtmSource[]> {
  const response = await fetch('/api/crm/utm');
  if (!response.ok) {
throw new Error('Failed to fetch UTM data');
}
  const data = await response.json();
  return data.utm_sources || [];
}

export function TopSourcesCard() {
  const { data: sources, isLoading } = useQuery<UtmSource[]>({
    queryKey: ['top-sources'],
    queryFn: fetchTopSources,
  });

  const totalRevenue = sources?.reduce((acc, source) => acc + source.revenue, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            <CardTitle>Top Lead Sources by Revenue</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/reports">
              View Report <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Performance of your top marketing channels this period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : sources && sources.length > 0 ? (
          <div className="space-y-4">
            {sources
              .sort((a, b) => b.revenue - a.revenue)
              .map((source) => (
                <div key={source.source} className="space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{source.source}</span>
                    <span>${source.revenue.toLocaleString()}</span>
                  </div>
                  <Progress value={(source.revenue / totalRevenue) * 100} className="h-2" />
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No revenue data available for lead sources.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}