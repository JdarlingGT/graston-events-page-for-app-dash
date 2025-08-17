"use client";

import { ProjectList } from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Projects</h1>
          <p className="text-muted-foreground">
            Collaborate, manage, and track progress on all your team's projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>
      <ProjectList />
    </div>
  );
}