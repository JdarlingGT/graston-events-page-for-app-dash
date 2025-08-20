'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, Eye, Edit, AlertTriangle, Clock, CheckCircle, ChevronUp, ChevronDown, Copy, Trash2, FileDown, Filter, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Mode = 'In-Person' | 'Virtual' | 'Hybrid';
type Status = 'upcoming' | 'cancelled' | 'completed' | 'ongoing';

interface EventRow {
  id: string;
  name: string;
  title?: string;
  city: string;
  state: string;
  instructor?: string;
  enrolledStudents: number;
  instrumentsPurchased?: number;
  capacity: number;
  minViableEnrollment: number;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: Mode;
  status: Status;
  featuredImage?: string;
  date?: string;       // ISO preferred
  startDate?: string;  // fallback
  endDate?: string;
}

interface EventsTableProps {
  events: EventRow[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSortChange: (nextBy: string, nextDir: 'asc' | 'desc') => void;
  onRefetch: () => void;
}

export function EventsTable({ events, sortBy, sortDir, onSortChange, onRefetch }: EventsTableProps) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const allSelected = useMemo(() => {
    if (!events?.length) {
return false;
}
    return events.every(e => selected[e.id]);
  }, [events, selected]);

  const selectedIds = useMemo(() => Object.keys(selected).filter(id => selected[id]), [selected]);

  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<string, boolean> = {};
      events.forEach(e => {
 next[e.id] = true; 
});
      setSelected(next);
    }
  };

  const toggleOne = (id: string, checked: boolean | string) => {
    setSelected(prev => ({ ...prev, [id]: !!checked }));
  };

  const formatDate = (iso?: string) => {
    if (!iso) {
return '';
}
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getRisk = (e: EventRow) => {
    const enrolled = e.enrolledStudents ?? 0;
    const minViable = e.minViableEnrollment ?? 0;
    const pct = (enrolled / Math.max(e.capacity || 1, 1)) * 100;

    if (enrolled < minViable) {
      return { text: 'At Risk', variant: 'destructive' as const, icon: AlertTriangle, description: `Below minimum viable enrollment of ${minViable}` };
    }
    if (pct >= 90) {
      return { text: 'Almost Full', variant: 'secondary' as const, icon: Clock, description: 'Limited spots remaining' };
    }
    if (enrolled >= minViable) {
      return { text: 'Healthy', variant: 'default' as const, icon: CheckCircle, description: 'Good enrollment numbers' };
    }
    return { text: 'Building', variant: 'outline' as const, icon: Users, description: 'Enrollment in progress' };
  };

  const header = (label: string, key: string) => {
    const active = sortBy === key;
    const nextDir = active ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    return (
      <button
        type="button"
        onClick={() => onSortChange(key, nextDir)}
        className="inline-flex items-center gap-1 text-left"
        aria-label={`Sort by ${label}`}
      >
        <span>{label}</span>
        {active ? (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : null}
      </button>
    );
  };

  const onQuickView = (e: EventRow) => {
    const payload = {
      id: e.id,
      title: e.title || e.name,
      instructor: { name: e.instructor || '' },
      location: { city: e.city, state: e.state },
      schedule: { startDate: e.date || e.startDate || '', endDate: e.endDate },
      enrollment: { current: e.enrolledStudents, capacity: e.capacity, minViable: e.minViableEnrollment },
      type: e.type,
      mode: e.mode,
      status: e.status,
      featuredImage: e.featuredImage,
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('event-quick-view', { detail: payload }));
    }
  };

  const exportCsv = () => {
    const selectedRows = events.filter(e => selected[e.id]);
    if (selectedRows.length === 0) {
      toast.info('Select at least one event to export.');
      return;
    }
    const cols = ['id','title','city','state','type','mode','status','enrolled','capacity','minViable','date'];
    const lines = [
      cols.join(','),
      ...selectedRows.map(e => {
        const values = [
          e.id,
          JSON.stringify(e.title || e.name),
          e.city,
          e.state,
          e.type,
          e.mode,
          e.status,
          String(e.enrolledStudents ?? 0),
          String(e.capacity ?? 0),
          String(e.minViableEnrollment ?? 0),
          (e.date || e.startDate || ''),
        ];
        return values.map(v => (v?.includes(',') ? JSON.stringify(v) : v)).join(',');
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-export-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success(`Exported ${selectedRows.length} events to CSV.`);
  };

  const cancelSelected = async () => {
    if (selectedIds.length === 0) {
      toast.info('Select at least one event to cancel.');
      return;
    }
    const confirm = window.confirm(`Cancel ${selectedIds.length} selected event(s)?`);
    if (!confirm) {
return;
}

    try {
      for (const id of selectedIds) {
        await fetch(`/api/events/${id}/cancel`, { method: 'POST' });
      }
      toast.success('Cancellation submitted.');
      setSelected({});
      onRefetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel selected events.');
    }
  };

  const duplicateSelected = async () => {
    if (selectedIds.length === 0) {
      toast.info('Select at least one event to duplicate.');
      return;
    }
    try {
      for (const id of selectedIds) {
        await fetch(`/api/events/${id}/duplicate`, { method: 'POST' });
      }
      toast.success('Duplication submitted.');
      setSelected({});
      onRefetch();
    } catch (err) {
      console.error(err);
      toast.error('Failed to duplicate selected events.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/20 p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="font-medium">{selectedIds.length}</span> event{selectedIds.length !== 1 ? 's' : ''} selected
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-xs text-muted-foreground">
              Bulk actions available
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <FileDown className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={duplicateSelected}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={cancelSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel Events
            </Button>
          </div>
        </div>
      )}

      {/* Enhanced Table */}
      <div className="rounded-md border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="p-3 text-left w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all events"
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </th>
                <th className="p-3 text-left min-w-[120px]">{header('Date', 'date')}</th>
                <th className="p-3 text-left min-w-[200px]">{header('Event Title', 'title')}</th>
                <th className="p-3 text-left min-w-[120px]">{header('Location', 'city')}</th>
                <th className="p-3 text-left min-w-[80px]">{header('State', 'state')}</th>
                <th className="p-3 text-left min-w-[100px]">{header('Type', 'type')}</th>
                <th className="p-3 text-left min-w-[100px]">{header('Mode', 'mode')}</th>
                <th className="p-3 text-left min-w-[100px]">{header('Status', 'status')}</th>
                <th className="p-3 text-left min-w-[100px]">{header('Enrollment', 'enrolled')}</th>
                <th className="p-3 text-left min-w-[120px]">{header('Risk Status', 'risk')}</th>
                <th className="p-3 text-right min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, index) => {
                const isoDate = e.date || e.startDate || '';
                const risk = getRisk(e);
                const RiskIcon = risk.icon;
                const pct = (e.enrolledStudents / Math.max(e.capacity || 1, 1)) * 100;
                const isSelected = !!selected[e.id];
                
                return (
                  <tr
                    key={e.id}
                    className={`border-b transition-colors hover:bg-muted/50 ${
                      isSelected ? 'bg-muted/30' : ''
                    } ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                  >
                    <td className="p-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(c) => toggleOne(e.id, c!)}
                        aria-label={`Select event ${e.title || e.name}`}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span className="font-medium text-foreground">{formatDate(isoDate)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground truncate max-w-[200px]" title={e.title || e.name}>
                          {e.title || e.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={e.instructor}>
                          {e.instructor || 'Unassigned'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="font-medium text-foreground">{e.city}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-foreground">{e.state}</span>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="font-medium">
                        {e.type}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="font-medium">
                        {e.mode}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={e.status === 'upcoming' ? 'default' : e.status === 'ongoing' ? 'secondary' : 'outline'}
                        className="capitalize font-medium"
                      >
                        {e.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground">
                            {e.enrolledStudents} / {e.capacity}
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5 w-full" />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-2">
                        <Badge variant={risk.variant} className="flex items-center gap-1 w-fit">
                          <RiskIcon className="h-3 w-3" />
                          {risk.text}
                        </Badge>
                        <div className="text-xs text-muted-foreground max-w-[120px]" title={risk.description}>
                          {risk.description}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => onQuickView(e)} title="Quick View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button asChild size="sm" variant="ghost" title="Edit Event">
                          <Link href={`/dashboard/events/${e.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" title="More actions">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/events/${e.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateSelected()}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => cancelSelected()}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Filter className="h-8 w-8" />
                      <div className="font-medium">No events found</div>
                      <div className="text-sm">Try adjusting your search filters or create a new event.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Footer with Summary */}
      {events.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/20 rounded-md p-3">
          <div className="flex items-center gap-4">
            <span>Showing {events.length} event{events.length !== 1 ? 's' : ''}</span>
            <div className="h-4 w-px bg-border" />
            <span>
              Total Enrollment: {events.reduce((sum, e) => sum + (e.enrolledStudents || 0), 0)} / {events.reduce((sum, e) => sum + (e.capacity || 0), 0)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Server-side filtering & sorting enabled</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsTable;