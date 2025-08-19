'use client';

import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Completed';
  channel: 'Facebook' | 'Google Ads' | 'Email';
  budget: number;
  spend: number;
  conversions: number;
  revenue: number;
}

export function CampaignManagement() {
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['marketing-campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/marketing/campaigns');
      if (!response.ok) {
throw new Error('Failed to fetch campaigns');
}
      return response.json();
    },
  });

  const columns: ColumnDef<Campaign>[] = [
    { accessorKey: 'name', header: 'Campaign' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'Active' ? 'default' : status === 'Paused' ? 'secondary' : 'outline'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    { accessorKey: 'channel', header: 'Channel' },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => `$${row.original.budget.toLocaleString()}`,
    },
    {
      accessorKey: 'spend',
      header: 'Spend',
      cell: ({ row }) => `$${row.original.spend.toLocaleString()}`,
    },
    { accessorKey: 'conversions', header: 'Conversions' },
    {
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ row }) => `$${row.original.revenue.toLocaleString()}`,
    },
    {
      id: 'roi',
      header: 'ROI',
      cell: ({ row }) => {
        const roi = ((row.original.revenue - row.original.spend) / row.original.spend) * 100;
        return (
          <span className={roi >= 0 ? 'text-green-600' : 'text-red-600'}>
            {roi.toFixed(1)}%
          </span>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Monitor and analyze all your marketing campaigns in one place.
            </CardDescription>
          </div>
          <Button onClick={() => toast.info('Campaign creation wizard coming soon!')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable columns={columns} data={campaigns} />
        )}
      </CardContent>
    </Card>
  );
}