import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { createCalendarEvent, sendGmailNotification } from '@/lib/google';
import { Task } from '@/components/tasks/task-board';

async function sendProjectNotification(type: string, task: any) {
  if (!task.projectId) return;
  // Fetch project info
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects`);
  const projects = await res.json();
  const project = projects.find((p: any) => p.id === task.projectId);
  if (!project) return;

  let recipientEmails: string[] = [];
  if (type === "assigned" && task.assignee?.name) {
    // For assignment, notify the assignee
    // For demo, try to match assignee name to project member emails (mock logic)
    recipientEmails = project.memberEmails || [];
  } else {
    // For other notifications, notify all project members
    recipientEmails = project.memberEmails || [];
  }

  // Call the notification API
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects/${project.id}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      task: {
        ...task,
        projectName: project.name,
      },
      recipientEmails,
    }),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let tasks = mockTasks;
  if (projectId) {
    tasks = mockTasks.filter(task => task.projectId === projectId);
  }

  return NextResponse.json(tasks, {
    headers: {
      'Cache-Control': 'private, max-age=10',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Omit<Task, 'id'>;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      ...body,
      status: 'todo', // New tasks always start in 'To Do'
      attachments: [], // Initialize with empty attachments
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

    // Project notification: assigned
    await sendProjectNotification("assigned", newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Not implemented for PATCH on all tasks
  return new NextResponse('Not Implemented', { status: 501 });
}