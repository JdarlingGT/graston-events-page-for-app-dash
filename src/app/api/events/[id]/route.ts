import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const events = await getEvents();
  const event = events.find((e: any) => e.id === params.id);

  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  return NextResponse.json(event);
}