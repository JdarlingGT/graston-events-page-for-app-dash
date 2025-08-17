import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const eventsFilePath = path.join(process.cwd(), 'public', 'mock-data', 'events.json');
const instructorsFilePath = path.join(process.cwd(), 'public', 'mock-data', 'instructors.json');

async function readJsonFile(filePath: string) {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return [];
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const instructors = await readJsonFile(instructorsFilePath);
  const instructor = instructors.find((i: any) => i.id === params.id);

  if (!instructor) {
    return new NextResponse('Instructor not found', { status: 404 });
  }

  const allEvents = await readJsonFile(eventsFilePath);
  // The mock data links instructors by name, so we'll filter by that.
  const instructorEvents = allEvents.filter((event: any) => event.instructor === instructor.name);

  return NextResponse.json(instructorEvents);
}