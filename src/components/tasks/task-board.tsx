"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { TaskColumn } from "./task-column";
import { TaskCard } from "./task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  tags?: string[];
}

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function TaskBoard() {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);
      queryClient.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map(task => task.id === taskId ? { ...task, ...updates } : task)
      );
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks'], context?.previousTasks);
      toast.error("Failed to update task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overColumnId = over.id.toString();
    
    const newStatus = columns.find(col => overColumnId.includes(col.id))?.id as Task['status'];

    if (activeTask && newStatus && activeTask.status !== newStatus) {
      updateTaskMutation.mutate({
        taskId: activeTask.id,
        updates: { status: newStatus },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-6">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Task
            </Button>
        </div>
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col md:flex-row gap-6 items-start">
            {columns.map((column) => {
                const columnTasks = tasks.filter((task) => task.status === column.id);
                return (
                <TaskColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                />
                );
            })}
            </div>

            <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    </div>
  );
}