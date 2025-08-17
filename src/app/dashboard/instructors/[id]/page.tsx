"use client";

import { InstructorDetail } from "@/components/directory/instructors/instructor-detail";

export default function InstructorDetailPage({ params }: { params: { id: string } }) {
  return <InstructorDetail instructorId={params.id} />;
}