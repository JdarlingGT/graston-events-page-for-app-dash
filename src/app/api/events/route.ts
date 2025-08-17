import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { eventSchema } from '@/lib/schemas';

const eventsDirectory = path.join(process.cwd(), 'public', 'mock-data', 'events');

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  instructor: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
  capacity: number;
  minViableEnrollment: number;
  type: "Essential" | "Advanced";
  mode: "In-Person" | "Virtual";
  status: "upcoming" | "ongoing" | "completed";
  featuredImage?: string;
  date: string; // Represents the start date
}

async function readAllEventFiles(): Promise<Event[]> {
  try {
    await fs.mkdir(eventsDirectory, { recursive: true });
    const files = await fs.readdir(eventsDirectory);
    const eventFiles = files.filter(file => file.endsWith('.json'));
    const allEvents: Event[] = [];
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

async function writeEventFile(event: Event) {
  try {
    await fs.mkdir(eventsDirectory, { recursive: true });
    const filePath = path.join(eventsDirectory, `${event.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(event, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write event file:', error);
    throw new Error('Could not save event data.');
  }
}

// Helper for danger zone status on server
const getDangerZoneStatusServer = (event: Event) => {
  if (event.enrolledStudents < event.minViableEnrollment) {
    return "at-risk";
  }
  if ((event.enrolledStudents / event.capacity) * 100 >= 90) {
    return "almost-full";
  }
  return "healthy";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search')?.toLowerCase() || '';
  const type = searchParams.get('type') || 'all';
  const mode = searchParams.get('mode') || 'all';
  const status = searchParams.get('status') || 'all';
  const dangerZone = searchParams.get('dangerZone') || 'all';
  const fromDateStr = searchParams.get('fromDate');
  const toDateStr = searchParams.get('toDate');
  const enrollmentMin = parseInt(searchParams.get('enrollmentMin') || '0');
  const enrollmentMax = parseInt(searchParams.get('enrollmentMax') || '100');
  const cities = searchParams.getAll('cities');
  const instructors = searchParams.getAll('instructors');

  let events: Event[] = await readAllEventFiles();

  // Apply filters
  let filteredEvents = events.filter(event => {
    const matchesSearch =
      event.name.toLowerCase().includes(query) ||
      event.instructor.toLowerCase().includes(query) ||
      event.city.toLowerCase().includes(query);

    const matchesType = type === "all" || event.type === type;
    const matchesMode = mode === "all" || event.mode === mode;
    const matchesStatus = status === "all" || event.status === status;

    const matchesDangerZone =
      dangerZone === "all" || getDangerZoneStatusServer(event) === dangerZone;

    const eventDate = new Date(event.date);
    const fromDate = fromDateStr ? new Date(fromDateStr) : null;
    const toDate = toDateStr ? new Date(toDateStr) : null;
    if (toDate) toDate.setHours(23, 59, 59, 999); // Include the whole end day

    const matchesDateRange =
      (!fromDate || eventDate >= fromDate) &&
      (!toDate || eventDate <= toDate);

    const matchesEnrollment =
      event.enrolledStudents >= enrollmentMin &&
      event.enrolledStudents <= enrollmentMax;

    const matchesCity =
      cities.length === 0 || cities.includes(event.city);
    const matchesInstructor =
      instructors.length === 0 || instructors.includes(event.instructor);

    return (
      matchesSearch &&
      matchesType &&
      matchesMode &&
      matchesStatus &&
      matchesDangerZone &&
      matchesDateRange &&
      matchesEnrollment &&
      matchesCity &&
      matchesInstructor
    );
  });

  return NextResponse.json(filteredEvents);
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