import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'archival-data.json');

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
}

const searchSchema = z.object({
  q: z.string().min(1, 'Search term is required'),
  type: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(10),
});

async function getArchivalData(): Promise<SearchResult[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read archival data:', error);
    // Return mock data if file doesn't exist
    return [
      {
        id: 'event-1',
        type: 'event',
        title: '2023 Annual Conference',
        description: 'The annual conference for Graston Technique practitioners.',
        date: '2023-05-15',
      },
      {
        id: 'order-1',
        type: 'order',
        title: 'Order #12345',
        description: 'Training materials order for New York event.',
        date: '2023-04-20',
      },
      {
        id: 'attendee-1',
        type: 'attendee',
        title: 'John Doe',
        description: 'Attendee from the 2023 conference.',
        date: '2023-05-15',
      },
    ];
  }
}

function filterResults(results: SearchResult[], filters: any): SearchResult[] {
  let filtered = [...results];

  // Search filter
  if (filters.q) {
    const searchTerm = filters.q.toLowerCase();
    filtered = filtered.filter(result =>
      result.title.toLowerCase().includes(searchTerm) ||
      result.description.toLowerCase().includes(searchTerm) ||
      result.type.includes(searchTerm),
    );
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(result => result.type === filters.type);
  }

  // Date range filter
  if (filters.start || filters.end) {
    filtered = filtered.filter(result => {
      const resultDate = new Date(result.date);
      const startDate = filters.start ? new Date(filters.start) : null;
      const endDate = filters.end ? new Date(filters.end) : null;

      if (startDate && endDate) {
        return resultDate >= startDate && resultDate <= endDate;
      } else if (startDate) {
        return resultDate >= startDate;
      } else if (endDate) {
        return resultDate <= endDate;
      }
      return true;
    });
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      start: searchParams.get('start') || undefined,
      end: searchParams.get('end') || undefined,
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
    };

    // Validate filters
    const validatedFilters = searchSchema.parse(filters);

    // Get all archival data
    const allResults = await getArchivalData();

    // Apply filters
    const filteredResults = filterResults(allResults, validatedFilters);

    // Apply pagination
    const total = filteredResults.length;
    const startIndex = (validatedFilters.page - 1) * validatedFilters.pageSize;
    const endIndex = startIndex + validatedFilters.pageSize;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const response = {
      data: paginatedResults,
      pagination: {
        total,
        page: validatedFilters.page,
        pageSize: validatedFilters.pageSize,
        totalPages: Math.ceil(total / validatedFilters.pageSize),
      },
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('GET /api/archival/search error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}