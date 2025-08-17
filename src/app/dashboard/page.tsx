"use client";

import { DangerZoneCard } from "@/components/dashboard/danger-zone-card";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";
import { UpcomingEventsCard } from "@/components/dashboard/upcoming-events-card";
import { RecentNotificationsCard } from "@/components/dashboard/recent-notifications-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Coordinator Dashboard</h1>
        <p className="text-muted-foreground">
          Your daily overview of what needs attention now.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DangerZoneCard />
        </div>
        <div className="space-y-6">
          <MyTasksCard />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingEventsCard />
        <RecentNotificationsCard />
      </div>
    </div>
  );
}