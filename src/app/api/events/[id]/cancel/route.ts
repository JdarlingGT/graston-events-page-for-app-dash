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

// POST /api/events/[id]/cancel
// Mock implementation: marks an event as "cancelled" and persists to mock JSON
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const events = await readEvents();
    const index = events.findIndex((e) => e.id === params.id);

    if (index === -1) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const event = events[index];

    // Mark cancelled and preserve original fields
    const updated = {
      ...event,
      status: 'cancelled',
    };
    events[index] = updated;

    await writeEvents(events);

    // In a real app, downstream effects would run here:
    // - Notify enrolled students
    // - Issue refunds as needed
    // - Update external systems (Woo, CRM, LD)
    // For now, we just return a success response.
    return NextResponse.json(
      {
        success: true,
        message: `Event ${params.id} cancelled.`,
        event: updated,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Failed to cancel event:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}