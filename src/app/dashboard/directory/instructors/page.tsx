"use client";

import { InstructorsTable } from "@/components/directory/instructors/instructors-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export default function InstructorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Instructors Directory</h1>
          <p className="text-muted-foreground">
            Browse, add, and manage all event instructors.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/directory/instructors/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Instructor
          </Link>
        </Button>
      </div>
      <InstructorsTable />
    </div>
  );
}