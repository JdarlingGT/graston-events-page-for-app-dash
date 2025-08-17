import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';
import { inPersonTrainingTasks, virtualTrainingTasks } from '@/lib/taskTemplates';

export async function POST(request: Request) {
  try {
    const { eventType, eventName } = await request.json() as { eventType: string, eventName: string };

    let templates = [];
    if (eventType === 'In-Person') {
      templates = inPersonTrainingTasks;
    } else if (eventType === 'Virtual') {
      templates = virtualTrainingTasks;
    } else {
      // Don't create tasks for other types, but don't error either
      return NextResponse.json({ success: true, created: 0 }, { status: 200 });
    }

    const newTasks = templates.map(template => ({
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: `${template.title} for ${eventName}`,
      description: template.description,
      status: 'todo' as const,
      priority: template.priority as 'low' | 'medium' | 'high',
      tags: template.tags,
    }));

    mockTasks.push(...newTasks);

    return NextResponse.json({ success: true, created: newTasks.length }, { status: 201 });
  } catch (error) {
    console.error('Failed to bulk create tasks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}