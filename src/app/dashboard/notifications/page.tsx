'use client';

import { EventNotifications } from '@/components/events/event-notifications';

export default function NotificationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications Center</h1>
        <p className="text-muted-foreground">
          A complete log of all system alerts, warnings, and updates.
        </p>
      </div>
      <EventNotifications showAll={true} />
    </div>
  );
}