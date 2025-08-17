import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';

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
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}