'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Mail, Edit } from 'lucide-react';
import { QuickEmailModal } from './quick-email-modal';
import { AddNoteModal } from './add-note-modal';

interface Student {
  id: string;
  name: string;
  email: string;
  checkedIn: boolean;
  notes: string;
  lastAttendance?: string;
}

interface StudentRosterProps {
  trainingId: string;
}

export function StudentRoster({ trainingId }: StudentRosterProps) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['training-students', trainingId],
    queryFn: async () => {
      const response = await fetch(`/api/trainings/${trainingId}/students`);
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, checkedIn }: { studentId: string; checkedIn: boolean }) => {
      const response = await fetch(`/api/trainings/${trainingId}/students/${studentId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedIn }),
      });
      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }
      return response.json();
    },
  });

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: 'name',
      header: 'Student',
      cell: ({ row }: { row: { original: Student } }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'lastAttendance',
      header: 'Last Attendance',
      cell: ({ row }: { row: { original: Student } }) => 
        row.original.lastAttendance 
          ? new Date(row.original.lastAttendance).toLocaleDateString()
          : 'Never',
    },
    {
      id: 'attendance',
      header: 'Check-in',
      cell: ({ row }: { row: { original: Student } }) => (
        <Switch
          checked={row.original.checkedIn}
          onCheckedChange={(checked) => {
            updateAttendanceMutation.mutate({
              studentId: row.original.id,
              checkedIn: checked,
            });
          }}
          className="data-[state=checked]:bg-green-500"
        />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Student } }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStudent(row.original);
              setIsNoteModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Note
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStudent(row.original);
              setIsEmailModalOpen(true);
            }}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton className="h-[400px]" />;
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={students}
        getRowClassName={(row) => row.original.checkedIn ? 'bg-green-50' : ''}
      />

      <QuickEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        studentEmails={selectedStudent ? [selectedStudent.email] : []}
      />

      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        studentName={selectedStudent?.name || ''}
        initialNote={selectedStudent?.notes || ''}
        onSave={async (note) => {
          if (selectedStudent) {
            const response = await fetch(`/api/trainings/${trainingId}/students/${selectedStudent.id}/notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ note }),
            });
            if (!response.ok) {
              throw new Error('Failed to save note');
            }
          }
        }}
      />
    </div>
  );
}