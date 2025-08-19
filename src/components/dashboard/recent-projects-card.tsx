'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderKanban, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '../ui/progress';

interface Project {
  id: string;
  name: string;
  progress: number;
}

async function fetchRecentProjects(): Promise<Project[]> {
  const response = await fetch('/api/projects?limit=3');
  if (!response.ok) {
throw new Error('Failed to fetch projects');
}
  return response.json();
}

export function RecentProjectsCard() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['recent-projects'],
    queryFn: fetchRecentProjects,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            <CardTitle>Recent Projects</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/projects">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          An overview of your team's most recent projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`} className="block">
                <div className="rounded-lg border bg-background p-3 hover:bg-muted transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-sm">{project.name}</p>
                    <span className="text-xs text-muted-foreground">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No active projects.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}