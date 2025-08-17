"use client";

import { TaskBoard } from "@/components/tasks/task-board";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function TasksPage() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // This is a simple check. In a real app, you'd have a dedicated endpoint.
    // For now, we assume if the token file exists, we are "connected".
    // This check is client-side and won't work perfectly, but it's good for UI feedback.
    // A proper solution would be an API route like /api/auth/status.
    // We'll just simulate it for now.
    const checkStatus = async () => {
        // This is a placeholder. A real implementation would make an API call.
        // For the demo, we can't check the server's file system from the client.
        // Let's assume not connected until after the redirect.
    };
    checkStatus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Task Management</h1>
            <p className="text-muted-foreground">
            Organize, assign, and track all your event-related tasks.
            </p>
        </div>
        <Button asChild>
            <a href="/api/auth/google">Connect to Google</a>
        </Button>
      </div>
      <TaskBoard />
    </div>
  );
}