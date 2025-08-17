"use client";

import { TaskBoard } from "@/components/tasks/task-board";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1>All Tasks</h1>
        <p className="text-muted-foreground">
          A comprehensive view of every task across all projects.
        </p>
      </div>
      <TaskBoard />
    </div>
  );
}