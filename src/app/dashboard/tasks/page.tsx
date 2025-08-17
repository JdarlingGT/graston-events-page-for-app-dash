"use client";

import { TaskBoard } from "@/components/tasks/task-board";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">
          Organize, assign, and track all your event-related tasks.
        </p>
      </div>
      <TaskBoard />
    </div>
  );
}