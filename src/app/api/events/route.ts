import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { eventSchema } from '@/lib/schemas';

const eventsDirectory = path.join(process.cwd(), 'public', 'mock-data', 'events');

async function readAllEventFiles() {
  try {
    // Ensure the directory exists before trying to read it
    await fs.mkdir(eventsDirectory, { recursive: true });
    const files = await fs.readdir(eventsDirectory);
    const eventFiles = files.filter(file => file.endsWith('.json'));
    const allEvents = [];
    for (const file of eventFiles) {
      const fileContents = await fs.readFile(path.join(eventsDirectory, file), 'utf8');
      allEvents.push(JSON.parse(fileContents));
    }
    return allEvents;
  } catch (error) {
    console.error('Failed to read event files:', error);
    return [];
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

export async function GET() {
  const events = await readAllEventFiles();
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = eventSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const newEvent = {
      id: `event-${Date.now()}`, // Generate a unique ID
      ...validation.data,
    };

    await writeEventFile(newEvent);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}