"use client";

import { useQuery } from "@tanstack/react-query";
import { TaskBoard } from "@/components/tasks/task-board";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch project details");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-[60vh] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="outline" className="w-fit">
        <Link href="/dashboard/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Projects
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold">{project?.name}</h1>
        <p className="text-muted-foreground">{project?.description}</p>
      </div>
      <TaskBoard projectId={params.id} />
    </div>
  );
}