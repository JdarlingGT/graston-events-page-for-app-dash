'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Share2 } from 'lucide-react';

interface CampaignPromotion {
  id: string;
  campaignId: string;
  type: 'email' | 'social';
  variant: 'A' | 'B';
  content: string;
  scheduledAt: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'sent';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function CampaignPromoter() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campaign-promotions'],
    queryFn: async (): Promise<{ promotions: CampaignPromotion[] }> => {
      const res = await fetch('/api/marketing/promoter');
      if (!res.ok) throw new Error('Failed to fetch promotions');
      return res.json();
    },
  });

  const getStatusColor = (status: CampaignPromotion['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'pending_approval': return 'outline';
      case 'approved': return 'default';
      case 'scheduled': return 'default';
      case 'sent': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Campaign Promoter</h1>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          data?.promotions.map((promo) => (
            <Card key={promo.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {promo.type === 'email' ? <Mail className="inline h-4 w-4 mr-1" /> : <Share2 className="inline h-4 w-4 mr-1" />}
                    Variant {promo.variant}
                  </span>
                  <Badge variant={getStatusColor(promo.status)}>{promo.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Scheduled: {new Date(promo.scheduledAt).toLocaleString()}
                </div>
                <div className="text-sm">{promo.content}</div>
                <div className="text-xs text-muted-foreground">Created by: {promo.createdBy}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}