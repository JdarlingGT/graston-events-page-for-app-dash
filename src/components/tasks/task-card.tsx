"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Task } from "./task-board";
import { cn } from "@/lib/utils";
import { Clock, Flag } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isUrgent = task.dueDate && task.status === 'todo' && differenceInDays(parseISO(task.dueDate), new Date()) < 3;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 ring-2 ring-primary",
        isOverlay && "shadow-xl"
      )}
    >
      <CardHeader className="p-4 pb-2">
        {isUrgent && (
            <Badge variant="destructive" className="w-fit mb-2">Urgent</Badge>
        )}
        <CardTitle className="text-base font-medium">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
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