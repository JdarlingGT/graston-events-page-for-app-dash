import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'events.json'), 'utf8');
    const events = JSON.parse(fileContents);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to read events data:', error);
    return new NextResponse('Internal Server Error: Could not load event data.', { status: 500 });
  }
}