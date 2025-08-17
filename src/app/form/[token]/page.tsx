"use client";

import { ParticipantForm } from "@/components/participant-form";

export default function ParticipantFormPage({ params }: { params: { token: string } }) {
  return (
    <div className="container mx-auto py-12">
      <ParticipantForm token={params.token} />
    </div>
  );
}