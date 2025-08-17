"use client";

import { ProjectList } from "@/components/projects/project-list";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Projects</h1>
        <p className="text-muted-foreground">
          Collaborate, manage, and track progress on all your team's projects.
        </p>
      </div>
      <ProjectList />
    </div>
  );
}