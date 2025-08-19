import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { createCalendarEvent, sendGmailNotification } from '@/lib/google';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const updates = await request.json();
    const taskIndex = mockTasks.findIndex(t => t.id === params.id);

    if (taskIndex === -1) {
      return new NextResponse('Task not found', { status: 404 });
    }

    const updatedTask = { ...mockTasks[taskIndex], ...updates };
    mockTasks[taskIndex] = updatedTask;
    
    // Trigger Google integrations on update
    await createCalendarEvent(updatedTask);
    // We need to add an email to the assignee object for this to work
    if (updatedTask.assignee) {
        const assigneeEmails: { [key: string]: string } = {
            'Sarah Johnson': 'user@example.com', // Replace with actual emails
            'Mike Chen': 'user@example.com',
            'Lisa Park': 'user@example.com',
        };
        const email = assigneeEmails[updatedTask.assignee.name];
        if (email) {
            await sendGmailNotification({ ...updatedTask, assignee: { ...updatedTask.assignee, email } });
        }
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(mockTasks[taskIndex]);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}