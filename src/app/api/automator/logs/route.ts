import { NextResponse } from 'next/server';

// Mock Automator log data
const mockAutomatorLogs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    recipeName: 'New Student Welcome Sequence',
    action: "Tag 'New Student' applied",
    user: 'Alice Johnson',
    userId: 'student-1',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    recipeName: 'Course Completion Certificate',
    action: "Certificate 'React Master' issued",
    user: 'Bob Smith',
    userId: 'student-2',
    status: 'success',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    recipeName: 'Low Enrollment Alert',
    action: "Email 'Low Enrollment Warning' sent to admin",
    user: 'System',
    userId: 'system',
    status: 'success',
  },
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000).toISOString(), // ~2 hours ago
    recipeName: 'New Lead Follow-up',
    action: "Contact 'Carol Davis' added to 'Lead Nurturing' sequence",
    user: 'Carol Davis',
    userId: 'student-3',
    status: 'success',
  },
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    recipeName: 'WooCommerce Order Sync',
    action: "Order #12345 synced, tag 'Purchased' applied",
    user: 'David Wilson',
    userId: 'student-4',
    status: 'success',
  },
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return NextResponse.json(mockAutomatorLogs);
}