'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { VenueFormValues, venueSchema } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  contactPerson: string;
  capacity: number;
}

interface VenueFormProps {
  initialData?: Venue | null;
}

export function VenueForm({ initialData }: VenueFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: initialData || {
      name: '',
      type: '',
      city: '',
      state: '',
      contactPerson: '',
      capacity: 0,
    },
  });

  const onSubmit = async (values: VenueFormValues) => {
    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData
        ? `/api/venues/${initialData.id}`
        : '/api/venues';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${initialData ? 'update' : 'create'} venue`);
      }

      toast.success(`Venue ${initialData ? 'updated' : 'created'} successfully!`);
      router.push('/dashboard/directory/venues');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Venue' : 'Create Venue'}</CardTitle>
        <CardDescription>
          Fill in the details below to {initialData ? 'update the' : 'add a new'}{' '}
          venue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Grand Tech Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Conference Center" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/directory/venues')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}