"use client";

import { InstructorForm } from "@/components/directory/instructors/instructor-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio: string;
  specialties: string;
}

export default function EditInstructorPage({ params }: { params: { id: string } }) {
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {    
    async function fetchInstructor() {
      try {
        const response = await fetch(`/api/instructors/${params.id}`);
        if (!response.ok) {
          throw new Error("Instructor not found");
        }
        const data = await response.json();
        setInstructor(data);
      } catch (err) {
        setError("Failed to load instructor data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInstructor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-8 w-1/2" />
        <div className="space-y-8 pt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  return <InstructorForm initialData={instructor} />;
}