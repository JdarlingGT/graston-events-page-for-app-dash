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
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { InstructorFormValues, instructorSchema } from '@/lib/schemas';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio: string;
  specialties: string;
}

interface InstructorFormProps {
  initialData?: Instructor | null;
}

export function InstructorForm({ initialData }: InstructorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(instructorSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      bio: '',
      specialties: '',
    },
  });

  const onSubmit = async (values: InstructorFormValues) => {
    setLoading(true);
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData
        ? `/api/instructors/${initialData.id}`
        : '/api/instructors';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${initialData ? 'update' : 'create'} instructor`);
      }

      toast.success(`Instructor ${initialData ? 'updated' : 'created'} successfully!`);
      router.push('/dashboard/directory/instructors');
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
        <CardTitle>{initialData ? 'Edit Instructor' : 'Create Instructor'}</CardTitle>
        <CardDescription>
          Fill in the details below to {initialData ? 'update the' : 'add a new'}{' '}
          instructor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dr. Jane Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="e.g., jane.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialties</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., React, Advanced JavaScript" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Biography</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="A brief bio about the instructor..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard/directory/instructors')}
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