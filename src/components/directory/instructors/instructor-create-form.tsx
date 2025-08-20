import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function InstructorCreateForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialties, setSpecialties] = useState('');

  const createMutation = useMutation({
    mutationFn: async (newInstructor) => {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInstructor),
      });
      if (!response.ok) {
        throw new Error('Failed to create instructor');
      }
    },
    onSuccess: () => {
      toast.success('Instructor created successfully.');
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      setName('');
      setEmail('');
      setSpecialties('');
    },
    onError: () => {
      toast.error('Failed to create instructor.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email, specialties } as any);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Specialties</label>
        <input value={specialties} onChange={(e) => setSpecialties(e.target.value)} required />
      </div>
      <Button type="submit">Create Instructor</Button>
    </form>
  );
}