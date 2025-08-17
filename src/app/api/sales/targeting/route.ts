import { NextResponse } from 'next/server';
import { mockProviders } from '@/lib/mock-data';
import path from 'path';
import { promises as fs } from 'fs';

const eventsDirectory = path.join(process.cwd(), 'public', 'mock-data', 'events');

async function readEventFile(id: string) {
  try {
    const filePath = path.join(eventsDirectory, `${id}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return new NextResponse('Event ID is required', { status: 400 });
  }

  const event = await readEventFile(eventId);
  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  // Simulate a delay for data processing
  await new Promise(resolve => setTimeout(resolve, 700));

  // Filtering logic:
  // 1. Provider's location matches event location (city)
  // 2. Provider has NOT already attended this specific event
  const targetedProviders = mockProviders.filter(provider => {
    const isInSameCity = provider.city === event.city;
    const hasNotAttended = !provider.trainingHistory.some(h => h.eventId === event.id);
    
    // For this example, we'll target anyone in the same city who hasn't attended this event.
    // A more advanced version could check for prerequisite courses.
    return isInSameCity && hasNotAttended;
  });

  return NextResponse.json(targetedProviders);
}