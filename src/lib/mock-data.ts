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
    attachments: [],
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
    attachments: [],
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
    attachments: [],
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
    attachments: [],
  },
  {
    id: "task-5",
    title: "Send Instructor Itinerary to John Doe",
    description: "Finalize and email the travel and speaking itinerary to the keynote speaker, John Doe.",
    status: "todo" as const,
    priority: "low" as const,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["Instructor", "Travel"],
    attachments: [],
  },
];

export interface Provider {
  id: string;
  name: string;
  email: string;
  city: string;
  state: string;
  providerType: string;
  trainingHistory: { eventId: string; eventName: string; date: string }[];
}

export const mockProviders: Provider[] = [
  { id: 'prov-1', name: 'Dr. Emily Carter', email: 'emily.carter@clinic.com', city: 'Austin', state: 'TX', providerType: 'Medical Doctor', trainingHistory: [{ eventId: '25995731', eventName: 'Essential Training Austin', date: '2023-05-15' }] },
  { id: 'prov-2', name: 'John Reed, RN', email: 'j.reed@hospital.org', city: 'Austin', state: 'TX', providerType: 'Registered Nurse', trainingHistory: [{ eventId: '25995731', eventName: 'Essential Training Austin', date: '2023-05-15' }] },
  { id: 'prov-3', name: 'Maria Garcia, PA', email: 'm.garcia@practice.net', city: 'New York', state: 'NY', providerType: 'Physician Assistant', trainingHistory: [{ eventId: '26012317', eventName: 'Essential Training NYC', date: '2023-06-20' }] },
  { id: 'prov-4', name: 'Dr. Chen Wei', email: 'chen.wei@medcenter.com', city: 'San Francisco', state: 'CA', providerType: 'Medical Doctor', trainingHistory: [{ eventId: '26017859', eventName: 'Essential Training SF', date: '2023-07-25' }] },
  { id: 'prov-5', name: 'Sarah Jenkins, NP', email: 's.jenkins@health.com', city: 'Austin', state: 'TX', providerType: 'Nurse Practitioner', trainingHistory: [] },
  { id: 'prov-6', name: 'David Lee', email: 'david.lee@rehab.com', city: 'Austin', state: 'TX', providerType: 'Physical Therapist', trainingHistory: [{ eventId: '25995731', eventName: 'Essential Training Austin', date: '2023-05-15' }] },
];