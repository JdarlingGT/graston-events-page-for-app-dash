'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@/components/tasks/task-board';
import { CheckSquare, ListTodo, AlertCircle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  memberAvatars: string[];
  progress: number;
}

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', project.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?projectId=${project.id}`);
      if (!response.ok) {
throw new Error('Failed to fetch tasks');
}
      return response.json();
    },
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  };

  const calculatedProgress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Project Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <ListTodo className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <CheckSquare className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold">{stats.overdue}</p>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(calculatedProgress)}%</span>
            </div>
            <Progress value={calculatedProgress} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.memberAvatars.map((avatar, index) => (
              <div key={index} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={avatar} />
                  <AvatarFallback>TM</AvatarFallback>
                </Avatar>
                <span className="font-medium">Team Member {index + 1}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}