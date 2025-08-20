import React from 'react';
import { InstructorList } from '@/components/directory/instructors/instructors-table';
import { InstructorCreateForm } from '@/components/directory/instructors/instructor-create-form';

export default function InstructorsPage() {
  return (
    <div>
      <h1>Instructors Management</h1>
      <InstructorCreateForm />
      <InstructorList />
    </div>
  );
}