import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real app, you would update the notification in your database
    return NextResponse.json({ 
      id: params.id, 
      read: true,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}