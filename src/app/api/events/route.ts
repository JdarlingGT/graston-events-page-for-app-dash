import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { eventSchema } from '@/lib/schemas';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'events.json');

async function getEvents() {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read events data:', error);
    return [];
  }
}

async function saveEvents(events: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(events, null, 2), 'utf8');
  } catch (error)
  {
    console.error('Failed to save events data:', error);
    throw new Error('Could not save event data.');
  }
}

export async function GET() {
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const events = await getEvents();
    const newEvent = {
      id: `event-${Date.now()}`,
      ...validation.data,
    };

    events.push(newEvent);
    await saveEvents(events);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}