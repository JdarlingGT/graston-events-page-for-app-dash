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

export async function GET(request: Request) {
  const events = await getEvents();
  // This endpoint will now just return all events.
  // The components will need to be updated to handle the new data structure.
  return NextResponse.json(events, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}