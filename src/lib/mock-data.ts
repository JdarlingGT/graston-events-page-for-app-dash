import type { Task } from "@/components/tasks/task-board";

export let mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Confirm Venue Booking for React Conf",
    description: "Contact 'The Grand Hall' to confirm booking and payment for the upcoming React Conference.",
    status: "todo" as const,
    priority: "high" as const,
    assignee: { name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    tags: ["Venue", "Logistics"],
  },
  {
    id: "task-2",
    title: "Test Webinar Link for Virtual Summit",
    description: "Ensure the webinar platform is configured correctly and the link is working for all speakers.",
    status: "in-progress" as const,
    priority: "high" as const,
    assignee: { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Virtual", "Tech Check"],
  },
  {
    id: "task-3",
    title: "Order Manuals for JavaScript Workshop",
    description: "Place an order for 50 copies of the 'Advanced JS' manual from the print shop.",
    status: "done" as const,
    priority: "medium" as const,
    assignee: { name: "Lisa Park", avatar: "https://i.pravatar.cc/150?img=3" },
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    tags: ["Materials", "Printing"],
  },
  {
    id: "task-4",
    title: "Send Attendee Login Info",
    description: "Draft and send the email containing login credentials and instructions to all registered attendees.",
    status: "todo" as const,
    priority: "medium" as const,
    assignee: { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Communication", "Virtual"],
  },
  {
    id: "task-5",
    title: "Send Instructor Itinerary to John Doe",
    description: "Finalize and email the travel and speaking itinerary to the keynote speaker, John Doe.",
    status: "todo" as const,
    priority: "low" as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Instructor", "Travel"],
  },
];