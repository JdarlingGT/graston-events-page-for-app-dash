import { NextResponse } from 'next/server';

// Mock event-specific notifications
const getEventNotifications = (eventId: string) => {
  const allNotifications = [
    {
      id: 'notif-1',
      type: 'warning',
      title: 'Low Enrollment Alert',
      message: 'This event has only 3 students enrolled with 2  weeks until the event date.',
      eventId: eventId,
      eventName: 'Advanced React Patterns Workshop',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      actionable: true,
      priority: 'high',
      data: { enrollmentCount: 3, threshold: 10 },
    },
    {
      id: 'notif-2',
      type: 'info',
      title: 'Course Materials Updated',
      message: 'Instructor has uploaded new materials for this workshop.',
      eventId: eventId,
      eventName: 'Advanced React Patterns Workshop',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionable: false,
      priority: 'low',
      data: { materialsCount: 5 },
    },
    {
      id: 'notif-3',
      type: 'success',
      title: 'New Enrollment',
      message: 'Sarah Johnson has enrolled and completed payment.',
      eventId: eventId,
      eventName: 'Advanced React Patterns Workshop',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionable: false,
      priority: 'medium',
      data: { studentName: 'Sarah Johnson', amount: 599 },
    },
  ];

  return allNotifications.filter(n => n.eventId === eventId);
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const notifications = getEventNotifications(params.id);
  
  return NextResponse.json(notifications);
}