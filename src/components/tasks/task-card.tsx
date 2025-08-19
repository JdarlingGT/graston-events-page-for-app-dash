'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from './task-board';
import { cn } from '@/lib/utils';
import { Clock, Flag, MoreHorizontal, Edit, Paperclip } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, isOverlay, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isUrgent = task.dueDate && task.status === 'todo' && differenceInDays(parseISO(task.dueDate), new Date()) < 3;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 ring-2 ring-primary',
        isOverlay && 'shadow-xl',
      )}
    >
      <CardHeader className="p-4 pb-2 flex-row items-start justify-between">
        <div className="space-y-2">
          {isUrgent && (
              <Badge variant="destructive" className="w-fit">Urgent</Badge>
          )}
          <CardTitle className="text-base font-medium" {...attributes} {...listeners}>{task.title}</CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" aria-label={`Task options for ${task.title}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3" {...attributes} {...listeners}>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        {task.attachments && task.attachments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1"><Paperclip className="h-3 w-3" /> Attachments</h4>
            <div className="flex flex-wrap gap-2">
              {task.attachments.map(file => (
                <Button key={file.id} variant="outline" size="sm" asChild className="h-auto py-1 px-2">
                  <Link href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <img src={file.iconUrl} alt="file icon" className="h-4 w-4" />
                    <span className="text-xs">{file.name}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                <Flag className="h-3 w-3 mr-1" />
                {task.priority}
            </Badge>
            {task.tags?.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          {task.assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback>
                {task.assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
}