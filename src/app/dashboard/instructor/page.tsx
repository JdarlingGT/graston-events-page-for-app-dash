'use client';

import { InstructorDashboard } from '@/components/instructor/instructor-dashboard';

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Instructor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome! Here are your upcoming and recent trainings.
        </p>
      </div>
      <InstructorDashboard />
    </div>
  );
}