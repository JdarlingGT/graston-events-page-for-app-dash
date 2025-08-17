"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { DangerZoneCard } from "@/components/dashboard/danger-zone-card";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { TopSourcesCard } from "@/components/dashboard/top-sources-card";
import { DollarSign, Calendar, AlertTriangle, CheckSquare } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Command Center</h1>
        <p className="text-muted-foreground">
          Your daily overview of actionable insights and urgent tasks.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue (Month)" value="$67,000" icon={DollarSign} />
        <StatCard title="Upcoming Events" value="15" icon={Calendar} />
        <StatCard title="At-Risk Events" value="3" icon={AlertTriangle} />
        <StatCard title="My Open Tasks" value="5" icon={CheckSquare} />
      </div>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <DangerZoneCard />
          <TopSourcesCard />
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <MyTasksCard />
          <UpcomingEventsCard />
        </div>
      </div>
    </div>
  );
}