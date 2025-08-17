import { NextRequest, NextResponse } from 'next/server';

// Mock task data
const mockTasks = [
  {
    id: "task-1",
    title: "Send welcome emails to enrolled students",
    description: "Create and send personalized welcome emails with course materials and pre-work instructions",
    status: "todo" as const,
    priority: "high" as const,
    assignee: {
      name: "Sarah Johnson",
      avatar: "https://picsum.photos/100/100?random=instructor"
    },
    dueDate: "2024-02-01",
    tags: ["Email", "Students"],
    createdAt: "2024-01-15"
  },
  {
    id: "task-2",
    title: "Prepare course materials",
    description: "Finalize slides, handouts, and exercise materials for the workshop",
    status: "in-progress" as const,
    priority: "high" as const,
    assignee: {
      name: "Sarah Johnson",
      avatar: "https://picsum.photos/100/100?random=instructor"
    },
    dueDate: "2024-02-10",
    tags: ["Materials", "Preparation"],
    createdAt: "2024-01-10"
  },
  {
    id: "task-3",
    title: "Confirm venue setup",
    description: "Coordinate with venue staff for room setup, AV equipment, and catering",
    status: "review" as const,
    priority: "medium" as const,
    assignee: {
      name: "Mike Chen",
      avatar: "https://picsum.photos/100/100?random=coordinator"
    },
    dueDate: "2024-02-05",
    tags: ["Venue", "Logistics"],
    createdAt: "2024-01-12"
  },
  {
    id: "task-4",
    title: "Order catering for lunch",
    description: "Arrange lunch catering for all attendees, including dietary restrictions",
    status: "done" as const,
    priority: "low" as const,
    assignee: {
      name: "Lisa Park",
      avatar: "https://picsum.photos/100/100?random=admin"
    },
    dueDate: "2024-01-30",
    tags: ["Catering", "Food"],
    createdAt: "2024-01-08"
  },
  {
    id: "task-5",
    title: "Create feedback survey",
    description: "Design post-event survey to collect feedback and testimonials",
    status: "todo" as const,
    priority: "low" as const,
    tags: ["Survey", "Feedback"],
    createdAt: "2024-01-18"
  }
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return NextResponse.json(mockTasks);
}