import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In a real app, you would update the task in your database
    // For now, just return the updates to simulate success
    return NextResponse.json({ 
      id: params.id, 
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}