'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { PlusCircle, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Voucher {
  voucherId: string;
  code: string;
  value: number;
  type: 'fixed' | 'percentage';
  expirationDate: string;
  status: 'Active' | 'Used' | 'Revoked';
}

interface VoucherManagementProps {
  clinicianId: string;
}

export function VoucherManagement({ clinicianId }: VoucherManagementProps) {
  const queryClient = useQueryClient();
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [voucherValue, setVoucherValue] = useState<number | string>('');
  const [voucherType, setVoucherType] = useState<'fixed' | 'percentage'>('fixed');
  const [expirationDate, setExpirationDate] = useState('');

  const { data: vouchers = [], isLoading } = useQuery<Voucher[]>({
    queryKey: ['vouchers', clinicianId],
    queryFn: async () => {
      const res = await fetch(`/api/clinicians/${clinicianId}/vouchers`);
      if (!res.ok) {
throw new Error('Failed to fetch vouchers');
}
      return res.json();
    },
  });

  const issueMutation = useMutation({
    mutationFn: (newVoucher: { value: number; type: string; expirationDate: string }) =>
      fetch(`/api/clinicians/${clinicianId}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVoucher),
      }).then(res => res.json()),
    onSuccess: () => {
      toast.success('Voucher issued successfully!');
      queryClient.invalidateQueries({ queryKey: ['vouchers', clinicianId] });
      setIsIssueDialogOpen(false);
      setVoucherValue('');
      setExpirationDate('');
    },
    onError: () => toast.error('Failed to issue voucher.'),
  });

  const revokeMutation = useMutation({
    mutationFn: (voucherId: string) =>
      fetch(`/api/clinicians/${clinicianId}/vouchers/${voucherId}`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      toast.success('Voucher revoked successfully!');
      queryClient.invalidateQueries({ queryKey: ['vouchers', clinicianId] });
    },
    onError: () => toast.error('Failed to revoke voucher.'),
  });

  const handleIssueVoucher = () => {
    const expDate = new Date(expirationDate);
    issueMutation.mutate({
      value: Number(voucherValue),
      type: voucherType,
      expirationDate: expDate.toISOString(),
    });
  };

  const columns: ColumnDef<Voucher>[] = [
    { accessorKey: 'code', header: 'Voucher Code' },
    {
      accessorKey: 'value',
      header: 'Value',
      cell: ({ row }) => row.original.type === 'fixed' ? `$${row.original.value}` : `${row.original.value}%`,
    },
    {
      accessorKey: 'expirationDate',
      header: 'Expires',
      cell: ({ row }) => format(new Date(row.original.expirationDate), 'MMM dd, yyyy'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === 'Active' ? 'default' : status === 'Used' ? 'secondary' : 'destructive'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={row.original.status !== 'Active'}
            >
              <Trash className="mr-2 h-4 w-4" />
              Revoke
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will revoke the voucher "{row.original.code}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => revokeMutation.mutate(row.original.voucherId)}>
                Revoke Voucher
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Issue New Voucher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Issue New Voucher</DialogTitle>
              <DialogDescription>
                Create a new training voucher for this clinician.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Type</Label>
                <Select value={voucherType} onValueChange={(v: 'fixed' | 'percentage') => setVoucherType(v)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Value</Label>
                <Input id="value" type="number" value={voucherValue} onChange={e => setVoucherValue(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiration" className="text-right">Expires</Label>
                <Input id="expiration" type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsIssueDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleIssueVoucher} disabled={issueMutation.isPending}>
                Issue Voucher
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? <Skeleton className="h-64 w-full" /> : <DataTable columns={columns} data={vouchers} />}
    </div>
  );
}