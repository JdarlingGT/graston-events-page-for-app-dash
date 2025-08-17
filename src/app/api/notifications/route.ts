import { NextResponse } from 'next/server';

// Mock notifications data
const mockNotifications = [
  {
    id: "notif-1",
    type: "warning",
    title: "Low Enrollment Alert",
    message: "React Workshop has only 3 students enrolled with 2 weeks until the event.",
    eventId: "event-123",
    eventName: "Advanced React Patterns Workshop",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read: false,
    actionable: true,
    priority: "high",
    data: { enrollmentCount: 3, threshold: 10 }
  },
  {
    id: "notif-2",
    type: "success",
    title: "Payment Received",
    message: "New student enrollment and payment confirmed for $599.",
    eventId: "event-456",
    eventName: "Essential JavaScript Bootcamp",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    read: false,
    actionable: false,
    priority: "medium",
    data: { amount: 599, studentName: "John Doe" }
  },
  {
    id: "notif-3",
    type: "info",
    title: "Course Materials Updated",
    message: "Instructor has uploaded new materials for the upcoming workshop.",
    eventId: "event-123",
    eventName: "Advanced React Patterns Workshop",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    read: true,
    actionable: false,
    priority: "low",
    data: { materialsCount: 5 }
  },
  {
    id: "notif-4",
    type: "warning",
    title: "Venue Confirmation Needed",
    message: "Venue booking requires confirmation within 48 hours.",
    eventId: "event-789",
    eventName: "Node.js Masterclass",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    read: false,
    actionable: true,
    priority: "high",
    data: { venueId: "venue-123", deadline: "2024-02-15" }
  },
  {
    id: "notif-5",
    type: "error",
    title: "Payment Failed",
    message: "Student payment attempt failed. Follow up required.",
    eventId: "event-456",
    eventName: "Essential JavaScript Bootcamp",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    read: false,
    actionable: true,
    priority: "high",
    data: { studentEmail: "student@example.com", amount: 599 }
  }
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return NextResponse.json(mockNotifications);
}