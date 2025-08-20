'use client';

import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Truck, Package, Clock, CheckCircle2, AlertTriangle, UserRound, Target, ArrowUpDown } from 'lucide-react';

type ShipmentStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'delayed' | 'canceled';
type ShipmentPriority = 'high' | 'medium' | 'low';

interface ShipmentItem {
  sku: string;
  name: string;
  qty: number;
}

interface Shipment {
  id: string;
  eventId?: string;
  eventName?: string;
  title: string;
  status: ShipmentStatus;
  priority: ShipmentPriority;
  assignee?: string;
  items: ShipmentItem[];
  notes?: string;
  address?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  slaDueAt?: string;
  createdAt: string;
  updatedAt: string;
  history?: Array<{
    at: string;
    from: ShipmentStatus;
    to: ShipmentStatus;
    by?: string;
    note?: string;
  }>;
}

interface ShipmentsResponse {
  shipments: Shipment[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  summary: Record<string, number>;
  timestamp: string;
}

const STATUS_OPTIONS: ShipmentStatus[] = ['pending', 'packed', 'shipped', 'delivered', 'delayed', 'canceled'];
const PRIORITY_OPTIONS: ShipmentPriority[] = ['high', 'medium', 'low'];

function variantForStatus(s: ShipmentStatus) {
  switch (s) {
    case 'pending': return 'secondary';
    case 'packed': return 'default';
    case 'shipped': return 'outline';
    case 'delivered': return 'default';
    case 'delayed': return 'destructive';
    case 'canceled': return 'destructive';
    default: return 'secondary';
  }
}

function daysUntil(dateIso?: string): number | undefined {
  if (!dateIso) {
return undefined;
}
  const due = new Date(dateIso).getTime();
  const now = Date.now();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

export function ShipmentsDashboard() {
  const qc = useQueryClient();

  // Query state
  const [status, setStatus] = useState<ShipmentStatus | 'all'>('all');
  const [priority, setPriority] = useState<ShipmentPriority | 'all'>('all');
  const [assignee, setAssignee] = useState('');
  const [eventId, setEventId] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'slaDueAt' | 'priority'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const queryKey = ['logistics-shipments', { status, priority, assignee, eventId, sortBy, sortOrder, page, limit }];
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async (): Promise<ShipmentsResponse> => {
      const sp = new URLSearchParams();
      if (status !== 'all') {
sp.append('status', status);
}
      if (priority !== 'all') {
sp.append('priority', priority);
}
      if (assignee) {
sp.set('assignee', assignee);
}
      if (eventId) {
sp.set('eventId', eventId);
}
      sp.set('sortBy', sortBy);
      sp.set('sortOrder', sortOrder);
      sp.set('page', String(page));
      sp.set('limit', String(limit));
      const res = await fetch(`/api/logistics/shipments?${sp.toString()}`);
      if (!res.ok) {
throw new Error('Failed to fetch shipments');
}
      return res.json();
    },
    placeholderData: (previousData) => previousData,
  });

  // Bulk ops
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);

  const bulkMutation = useMutation({
    mutationFn: async (payload: { ids: string[]; op: 'status' | 'assign' | 'note'; value: any; by?: string }) => {
      const res = await fetch('/api/logistics/shipments', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
throw new Error('Bulk update failed');
}
      return res.json();
    },
    onSuccess: () => {
      setSelected({});
      qc.invalidateQueries({ queryKey: ['logistics-shipments'] });
    },
  });

  const toggleAll = (checked: boolean) => {
    if (!data?.shipments) {
return;
}
    const next: Record<string, boolean> = {};
    data.shipments.forEach((s) => {
 next[s.id] = checked; 
});
    setSelected(next);
  };

  const onToggle = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipments Queue</h1>
          <p className="text-sm text-muted-foreground">
            Track and action logistics shipments with SLA due times and event linkage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter by status, assignee, event linkage, and priority</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-6">
          <div className="space-y-1">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: any) => {
 setPage(1); setStatus(v); 
}}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v: any) => {
 setPage(1); setPriority(v); 
}}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {PRIORITY_OPTIONS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Assignee</Label>
            <Input placeholder="email or name" value={assignee} onChange={(e) => {
 setPage(1); setAssignee(e.target.value); 
}} />
          </div>
          <div className="space-y-1">
            <Label>Event ID</Label>
            <Input placeholder="evt_xxx" value={eventId} onChange={(e) => {
 setPage(1); setEventId(e.target.value); 
}} />
          </div>
          <div className="space-y-1">
            <Label>Sort</Label>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                  <SelectItem value="slaDueAt">SLA Due</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Page Size</Label>
            <Select value={String(limit)} onValueChange={(v: any) => {
 setPage(1); setLimit(Number(v)); 
}}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((n) => (<SelectItem key={n} value={String(n)}>{n}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {(['pending', 'packed', 'shipped', 'delivered', 'delayed', 'canceled'] as ShipmentStatus[]).map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">{s}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.summary?.[s] ?? 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipments
          </CardTitle>
          <CardDescription>Perform bulk actions on selected shipments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Select</Label>
              <Button size="sm" variant="outline" onClick={() => toggleAll(true)}>All</Button>
              <Button size="sm" variant="outline" onClick={() => toggleAll(false)}>None</Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedIds.length || bulkMutation.isPending}
              onClick={() => bulkMutation.mutate({ ids: selectedIds, op: 'status', value: 'packed', by: 'operator@org.com' })}
            >
              Mark Packed
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedIds.length || bulkMutation.isPending}
              onClick={() => bulkMutation.mutate({ ids: selectedIds, op: 'status', value: 'shipped', by: 'operator@org.com' })}
            >
              Mark Shipped
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!selectedIds.length || bulkMutation.isPending}
              onClick={() => bulkMutation.mutate({ ids: selectedIds, op: 'assign', value: 'logistics@org.com', by: 'operator@org.com' })}
            >
              Assign
            </Button>
          </div>

          {/* Table-like list */}
          <div className="border rounded-md overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted text-xs font-medium">
              <div className="col-span-1"><Checkbox checked={data?.shipments?.every((s) => selected[s.id]) && (data?.shipments?.length || 0) > 0} onCheckedChange={(c) => toggleAll(!!c)} /></div>
              <div className="col-span-3">Title</div>
              <div className="col-span-2">Event</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-1">Assignee</div>
              <div className="col-span-2">SLA Due</div>
            </div>
            <div className="divide-y">
              {isLoading ? (
                <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading shipments...
                </div>
              ) : (
                data?.shipments?.map((s) => {
                  const dueDays = daysUntil(s.slaDueAt);
                  const overdue = typeof dueDays === 'number' && dueDays < 0;
                  const dueSoon = typeof dueDays === 'number' && dueDays <= 2 && dueDays >= 0;

                  return (
                    <div key={s.id} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                      <div className="col-span-1">
                        <Checkbox checked={!!selected[s.id]} onCheckedChange={(c) => onToggle(s.id, !!c)} />
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">{new Date(s.updatedAt).toLocaleString()}</div>
                      </div>
                      <div className="col-span-2">
                        {s.eventName ? (
                          <div className="text-sm">{s.eventName}</div>
                        ) : (
                          <div className="text-xs text-muted-foreground">—</div>
                        )}
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <Badge variant={variantForStatus(s.status)} className="capitalize">{s.status}</Badge>
                        {s.status === 'delayed' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        {s.status === 'delivered' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      </div>
                      <div className="col-span-1">
                        <Badge variant={s.priority === 'high' ? 'destructive' : s.priority === 'medium' ? 'default' : 'secondary'} className="capitalize">
                          {s.priority}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-sm">
                        {s.assignee ?? '—'}
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {s.slaDueAt ? new Date(s.slaDueAt).toLocaleString() : '—'}
                        {typeof dueDays === 'number' && (
                          <span className={`text-xs ${overdue ? 'text-red-600' : dueSoon ? 'text-yellow-600' : 'text-muted-foreground'}`}>
                            {overdue ? `${Math.abs(dueDays)}d overdue` : dueSoon ? `${dueDays}d left` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShipmentsDashboard;