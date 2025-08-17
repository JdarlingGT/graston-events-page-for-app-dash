"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { DangerZoneCard } from "@/components/dashboard/danger-zone-card";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { DollarSign, Calendar, AlertTriangle, CheckSquare } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Coordinator Dashboard</h1>
        <p className="text-muted-foreground">
          A data-rich overview of your event operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue (Month)" value="$67,000" icon={DollarSign} />
        <StatCard title="Upcoming Events" value="15" icon={Calendar} />
        <StatCard title="At-Risk Events" value="3" icon={AlertTriangle} />
        <StatCard title="Open Tasks" value="8" icon={CheckSquare} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesOverviewChart />
        </div>
        <div className="space-y-6">
          <MyTasksCard />
          <UpcomingEventsCard />
        </div>
      </div>

      <DangerZoneCard />
    </div>
  );
}