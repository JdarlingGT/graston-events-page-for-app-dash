import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { eventSchema } from '@/lib/schemas';

const eventsDirectory = path.join(process.cwd(), 'public', 'mock-data', 'events');

async function readEventFile(id: string) {
  try {
    const filePath = path.join(eventsDirectory, `${id}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null; // File not found
    }
    console.error(`Failed to read event file ${id}:`, error);
    throw new Error('Could not read event data.');
  }
}

async function writeEventFile(event: any) {
  try {
    await fs.mkdir(eventsDirectory, { recursive: true }); // Ensure directory exists
    const filePath = path.join(eventsDirectory, `${event.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(event, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write event file:', error);
    throw new Error('Could not save event data.');
  }
}

async function deleteEventFile(id: string) {
  try {
    const filePath = path.join(eventsDirectory, `${id}.json`);
    await fs.unlink(filePath);
    return true; // Successfully deleted
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false; // File not found, consider it already deleted
    }
    console.error('Failed to delete event file:', error);
    throw new Error('Could not delete event data.');
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const event = await readEventFile(params.id);

  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const existingEvent = await readEventFile(params.id);
    if (!existingEvent) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const updatedEvent = {
      ...existingEvent,
      ...validation.data,
      id: params.id, // Ensure ID remains consistent
    };

    await writeEventFile(updatedEvent);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteEventFile(params.id);
    if (!deleted) {
      return new NextResponse('Event not found', { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}