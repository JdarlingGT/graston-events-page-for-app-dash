"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckSquare, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "../ui/badge";

interface Task {
  id: string;
  title: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  assignee?: { name: string };
}

// Mocking the current user
const CURRENT_USER = "Sarah Johnson";

async function fetchMyTasks(): Promise<Task[]> {
  const response = await fetch("/api/tasks");
  if (!response.ok) throw new Error("Failed to fetch tasks");
  const tasks = await response.json();
  return tasks
    .filter((task: Task) => task.status !== "done" && task.assignee?.name === CURRENT_USER)
    .sort((a: Task, b: Task) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);
}

export function MyTasksCard() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["my-tasks"],
    queryFn: fetchMyTasks,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            <CardTitle>My Tasks</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/tasks">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Your assigned tasks sorted by due date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    Due {formatDistanceToNow(parseISO(task.dueDate!), { addSuffix: true })}
                  </p>
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No upcoming tasks assigned to you. Great job!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}