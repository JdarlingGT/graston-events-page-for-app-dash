import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'attendees.json');

async function getAttendees() {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read attendees data:', error);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  const allAttendees = await getAttendees();
  const eventAttendees = allAttendees.filter((att: any) => att.eventId === eventId);

  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(eventAttendees);
}