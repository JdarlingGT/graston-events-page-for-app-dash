import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'events.json');

async function readEvents() {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as any[];
  } catch (err) {
    console.error('Failed to read events.json:', err);
    return [];
  }
}

async function writeEvents(events: any[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(events, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write events.json:', err);
    throw err;
  }
}

function generateId(base: string = 'evt'): string {
  return `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// POST /api/events/[id]/duplicate
// Mock implementation: clones event with new id, status 'upcoming', and preserves core fields
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const events = await readEvents();
    const original = events.find((e) => e.id === params.id);

    if (!original) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const newId = generateId('evt-copy');
    // Attempt to create a sensible duplicate title
    const newTitle = original.title || original.name || 'Untitled Event';
    const duplicated = {
      ...original,
      id: newId,
      // keep the same date fields; in a real system, UI would prompt for new dates
      status: 'upcoming',
      // reset some counters that typically shouldn't be copied verbatim
      enrolledStudents: 0,
      enrolledCount: 0,
      instrumentsPurchased: 0,
    };

    events.push(duplicated);
    await writeEvents(events);

    return NextResponse.json(
      {
        success: true,
        message: `Event ${params.id} duplicated as ${newId}.`,
        event: duplicated,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Failed to duplicate event:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}