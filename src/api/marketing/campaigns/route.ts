import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');

export async function GET() {
  try {
    const fileContents = await fs.readFile(path.join(jsonDirectory, 'campaigns.json'), 'utf8');
    const campaigns = JSON.parse(fileContents);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    return NextResponse.json(campaigns);
  } catch (error) {
    return new NextResponse('Failed to fetch campaign data', { status: 500 });
  }
}