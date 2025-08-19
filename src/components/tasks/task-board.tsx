'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { TaskColumn } from './task-column';
import { TaskCard } from './task-card';
import { TaskModal } from './task-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { PlusCircle } from 'lucide-react';
import { TaskFormValues } from '@/lib/schemas';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  iconUrl: string;
}

export interface Comment {
  id: string;
  author: { name: string; avatar?: string };
  timestamp: string;
  text: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  tags?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
  projectId?: string;
}

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

// Mock assignees for the dropdown
const assignees = [
  { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Mike Chen', avatar: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Lisa Park', avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Unassigned', avatar: '' },
];

export function TaskBoard({ projectId }: { projectId?: string }) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const queryKey = projectId ? ['tasks', projectId] : ['tasks'];
  const apiUrl = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(apiUrl);
      if (!response.ok) {
throw new Error('Failed to fetch tasks');
}
      return response.json();
    },
  });

  const handleOptimisticUpdate = (updatedTask: Partial<Task> & { id: string }) => {
    queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
      old.map(task => task.id === updatedTask.id ? { ...task, ...updatedTask } : task),
    );
  };

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id'>) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
throw new Error('Failed to create task');
}
      return response.json();
    },
    onSuccess: () => {
      toast.success('Task created successfully!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      handleOptimisticUpdate({ ...updates, id: taskId });
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
throw new Error('Failed to update task');
}
      return response.json();
    },
    onSuccess: () => toast.success('Task updated successfully!'),
    onError: () => toast.error('Failed to update task'),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || active.id === over.id) {
return;
}
    const activeTask = tasks.find((t) => t.id === active.id);
    const newStatus = columns.find(col => over.id.toString().includes(col.id))?.id as Task['status'];
    if (activeTask && newStatus && activeTask.status !== newStatus) {
      updateTaskMutation.mutate({ taskId: activeTask.id, updates: { status: newStatus } });
    }
  };

  const handleOpenModal = (task: Task | null = null) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleFormSubmit = (values: TaskFormValues, taskId?: string) => {
    const assigneeData = assignees.find(a => a.name === values.assigneeName);
    const submissionData = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate?.toISOString(),
      assignee: assigneeData && assigneeData.name !== 'Unassigned' ? assigneeData : undefined,
      projectId: projectId, // Add projectId to new tasks
    };

    if (taskId) {
      updateTaskMutation.mutate({ taskId, updates: submissionData });
    } else {
      createTaskMutation.mutate(submissionData as Omit<Task, 'id'>);
    }
    handleCloseModal();
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
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.id);
            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onEdit={handleOpenModal}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay onEdit={handleOpenModal} /> : null}
        </DragOverlay>
      </DndContext>
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        task={editingTask}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </div>
  );
}