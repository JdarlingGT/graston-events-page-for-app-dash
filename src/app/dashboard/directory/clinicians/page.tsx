"use client";

import { CliniciansTable } from "@/components/directory/clinicians/clinicians-table";

export default function CliniciansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Clinicians Directory</h1>
        <p className="text-muted-foreground">
          Browse and manage all clinicians in the system.
        </p>
      </div>
      <CliniciansTable />
    </div>
  );
}