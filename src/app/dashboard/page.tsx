"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { DangerZoneCard } from "@/components/dashboard/danger-zone-card";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";
import { UpcomingEventsMapCard } from "@/components/dashboard/upcoming-events-map-card";
import { TopSourcesCard } from "@/components/dashboard/top-sources-card";
import { RecentProjectsCard } from "@/components/dashboard/recent-projects-card";
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
        <StatCard title="Total Revenue (Month)" value="$67,000" icon={DollarSign} change={5.2} changeDescription="vs last month" />
        <StatCard title="Upcoming Events" value="15" icon={Calendar} change={-1.1} changeDescription="vs last month" />
        <StatCard title="At-Risk Events" value="3" icon={AlertTriangle} change={2.5} changeDescription="vs last week" />
        <StatCard title="My Open Tasks" value="5" icon={CheckSquare} />
      </div>
      
      {/* Main Grid Layout for Actionable Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <DangerZoneCard />
        </div>
        <div className="lg:col-span-3">
          <UpcomingEventsMapCard />
        </div>
        <div className="lg:col-span-1">
          <MyTasksCard />
        </div>
        <div className="lg:col-span-1">
          <TopSourcesCard />
        </div>
        <div className="lg:col-span-1">
          <RecentProjectsCard />
        </div>
      </div>
    </div>
  );
}