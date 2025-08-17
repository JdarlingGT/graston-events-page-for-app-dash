import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { createCalendarEvent, sendGmailNotification } from '@/lib/google';

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(mockTasks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTask = {
      id: `task-${Date.now()}`,
      ...body,
      status: 'todo', // New tasks always start in 'To Do'
    };
    mockTasks.push(newTask);

    // Trigger Google integrations
    await createCalendarEvent(newTask);
    // We need to add an email to the assignee object for this to work
    if (newTask.assignee) {
        const assigneeEmails: { [key: string]: string } = {
            "Sarah Johnson": "user@example.com", // Replace with actual emails
            "Mike Chen": "user@example.com",
            "Lisa Park": "user@example.com",
        };
        const email = assigneeEmails[newTask.assignee.name];
        if (email) {
            await sendGmailNotification({ ...newTask, assignee: { ...newTask.assignee, email } });
        }
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}