'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { CustomerJourneyModal } from './customer-journey-modal';

interface Conversion {
  orderId: string;
  customer: string;
  date: string;
  value: number;
  firstTouch: string;
  lastTouch: string;
}

const mockConversions: Conversion[] = [
  { orderId: '#12345', customer: 'John Doe', date: '2024-07-20', value: 599, firstTouch: 'Google Ads', lastTouch: 'Email' },
  { orderId: '#12346', customer: 'Jane Smith', date: '2024-07-21', value: 599, firstTouch: 'Facebook', lastTouch: 'Facebook' },
  { orderId: '#12347', customer: 'Peter Jones', date: '2024-07-22', value: 499, firstTouch: 'Organic', lastTouch: 'Direct' },
];

export function AttributionDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: ColumnDef<Conversion>[] = [
    { accessorKey: 'orderId', header: 'Order ID' },
    { accessorKey: 'customer', header: 'Customer' },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'value', header: 'Value', cell: ({ row }) => `$${row.original.value}` },
    { accessorKey: 'firstTouch', header: 'First Touch' },
    { accessorKey: 'lastTouch', header: 'Last Touch' },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
          View Journey
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Multi-Touch Attribution</CardTitle>
              <CardDescription>Analyze conversions based on different attribution models.</CardDescription>
            </div>
            <div className="w-48">
              <Select defaultValue="linear">
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first-touch">First-Touch</SelectItem>
                  <SelectItem value="last-touch">Last-Touch</SelectItem>
                  <SelectItem value="linear">Linear Multi-Touch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockConversions} />
        </CardContent>
      </Card>
      <CustomerJourneyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}