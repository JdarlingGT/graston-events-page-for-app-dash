import { NextResponse } from 'next/server';
import { mockTasks } from '@/lib/mock-data';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const taskIndex = mockTasks.findIndex(t => t.id === params.id);

    if (taskIndex === -1) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Update the task in the array
    mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json(mockTasks[taskIndex]);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}