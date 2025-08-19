'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './task-card';
import { Task } from './task-board';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  column: { id: string; title: string };
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export function TaskColumn({ column, tasks, onEdit }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Sort tasks to show urgent ones first
  const sortedTasks = [...tasks].sort((a, b) => {
    const isAUrgent = a.dueDate && new Date(a.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && a.status === 'todo';
    const isBUrgent = b.dueDate && new Date(b.dueDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && b.status === 'todo';
    if (isAUrgent && !isBUrgent) {
return -1;
}
    if (!isAUrgent && isBUrgent) {
return 1;
}
    return 0;
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 p-4 bg-muted/50 rounded-lg transition-colors duration-200 min-h-[300px]',
        isOver && 'bg-muted',
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <SortableContext
        items={sortedTasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}