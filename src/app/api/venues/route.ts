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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const filter = searchParams.get('filter') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const venues = await getVenues();

  // Filter by search term
  let filteredVenues = venues.filter(venue =>
    Object.values(venue).some(val =>
      typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Filter by type
  if (filter) {
    filteredVenues = filteredVenues.filter(venue => venue.type === filter);
  }

  // Paginate results
  const total = filteredVenues.length;
  const paginatedVenues = filteredVenues.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({
    venues: paginatedVenues,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = venueSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const venues = await getVenues();
    const newVenue = {
      id: `venue-${Date.now()}`,
      ...validation.data,
    };

    venues.push(newVenue);
    await saveVenues(venues);

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}