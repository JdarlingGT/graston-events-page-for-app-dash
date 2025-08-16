import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { venueSchema } from '@/lib/schemas';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'venues.json');

async function getVenues() {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read venues data:', error);
    return [];
  }
}

async function saveVenues(venues: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(venues, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save venues data:', error);
    throw new Error('Could not save venue data.');
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const venues = await getVenues();
  const venue = venues.find((v: any) => v.id === params.id);

  if (!venue) {
    return new NextResponse('Venue not found', { status: 404 });
  }

  return NextResponse.json(venue);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = venueSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    let venues = await getVenues();
    const venueIndex = venues.findIndex((v: any) => v.id === params.id);

    if (venueIndex === -1) {
      return new NextResponse('Venue not found', { status: 404 });
    }

    const updatedVenue = {
      ...venues[venueIndex],
      ...validation.data,
    };
    venues[venueIndex] = updatedVenue;

    await saveVenues(venues);

    return NextResponse.json(updatedVenue);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    let venues = await getVenues();
    const venueExists = venues.some((v: any) => v.id === params.id);

    if (!venueExists) {
      return new NextResponse('Venue not found', { status: 404 });
    }

    const updatedVenues = venues.filter((v: any) => v.id !== params.id);
    await saveVenues(updatedVenues);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}