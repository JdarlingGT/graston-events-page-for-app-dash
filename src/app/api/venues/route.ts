import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET() {
  try {
    // Construct the path to the JSON file in the public directory
    const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'venues.json'), 'utf8');
    
    // Parse the file content and send it as a response
    const venues = JSON.parse(fileContents);
    return NextResponse.json(venues);
  } catch (error) {
    console.error('Failed to read venues data:', error);
    // Return an error response if the file can't be read
    return new NextResponse('Internal Server Error: Could not load venue data.', { status: 500 });
  }
}