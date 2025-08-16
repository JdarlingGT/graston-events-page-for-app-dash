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
  } catch (error) {
    console.error('Failed to save events data:', error);
    throw new Error('Could not save event data.');
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const events = await getEvents();
  const event = events.find((e: any) => e.id === params.id);

  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    let events = await getEvents();
    const eventIndex = events.findIndex((e: any) => e.id === params.id);

    if (eventIndex === -1) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const updatedEvent = {
      ...events[eventIndex],
      ...validation.data,
    };
    events[eventIndex] = updatedEvent;

    await saveEvents(events);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    let events = await getEvents();
    const eventExists = events.some((e: any) => e.id === params.id);

    if (!eventExists) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const updatedEvents = events.filter((e: any) => e.id !== params.id);
    await saveEvents(updatedEvents);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}