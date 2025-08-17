"use client";

import { AttributionDashboard } from "@/components/dashboard/marketing/attribution-dashboard";

export default function MarketingPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing Intelligence</h1>
        <p className="text-muted-foreground">
          Analyze the full customer journey and campaign performance.
        </p>
      </div>
      <AttributionDashboard />
    </div>
  );
}