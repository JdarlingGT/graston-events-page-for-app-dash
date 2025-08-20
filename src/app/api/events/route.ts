import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'events.json');

type Mode = 'In-Person' | 'Virtual' | 'Hybrid';
type Status = 'upcoming' | 'cancelled' | 'completed' | 'ongoing';

interface Event {
  id: string;
  name: string;
  title?: string;
  city: string;
  state: string;
  instructor?: string;
  enrolledStudents: number;
  instrumentsPurchased?: number;
  capacity: number;
  minViableEnrollment: number;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: Mode;
  status: Status;
  featuredImage?: string;
  date?: string;       // ISO preferred
  startDate?: string;  // fallback
  endDate?: string;
}

/**
 * Load all events from mock-data
 */
async function getEvents(): Promise<Event[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read events data:', error);
    return [];
  }
}

/**
 * Derive a normalized event date (ISO string) using `date` or fallback to `startDate`
 */
function getEventISODate(e: Event): string | undefined {
  return e.date || e.startDate;
}

/**
 * Compute derived risk classification used by UI filters
 * - at-risk: enrolledStudents < minViableEnrollment
 * - almost-full: enrolled/capacity ≥ 90%
 * - healthy: enrolled ≥ minViable and < 90%
 * - building: default catch-all
 */
function computeRisk(e: Event): 'at-risk' | 'almost-full' | 'healthy' | 'building' {
  const enrolled = e.enrolledStudents ?? 0;
  const minViable = e.minViableEnrollment ?? 0;
  const capacity = e.capacity || 1;
  const pct = (enrolled / capacity) * 100;

  if (enrolled < minViable) {
return 'at-risk';
}
  if (pct >= 90) {
return 'almost-full';
}
  if (enrolled >= minViable) {
return 'healthy';
}
  return 'building';
}

/**
 * GET /api/events
 * Supports server-side filtering and sorting to power the Events Hub:
 * - search: string (matches name/title/city/state/instructor)
 * - type: 'all' | Event['type']
 * - mode: 'all' | Mode
 * - status: 'all' | Status
 * - dangerZone: 'all' | 'at-risk' | 'almost-full' | 'healthy' | 'building'
 * - fromDate, toDate: YYYY-MM-DD filters using event date or startDate
 * - sortBy: 'date' | 'city' | 'state' | 'type' | 'mode' | 'status' | 'enrolled' | 'capacity' | 'risk'
 * - sortDir: 'asc' | 'desc'
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const search = (url.searchParams.get('search') || '').toLowerCase().trim();
  const type = url.searchParams.get('type') || 'all';
  const mode = url.searchParams.get('mode') || 'all';
  const status = url.searchParams.get('status') || 'all';
  const dangerZone = url.searchParams.get('dangerZone') || 'all';
  const fromDate = url.searchParams.get('fromDate'); // YYYY-MM-DD
  const toDate = url.searchParams.get('toDate');     // YYYY-MM-DD

  const sortBy = url.searchParams.get('sortBy') || 'date';
  const sortDir = (url.searchParams.get('sortDir') || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

  const events = await getEvents();

  // Normalize and enrich (attach derived fields without changing public contract)
  const enriched = events.map(e => {
    const _isoDate = getEventISODate(e);
    const _risk = computeRisk(e);
    return { e, _isoDate, _risk };
  });

  // Filtering
  let filtered = enriched;

  if (search) {
    filtered = filtered.filter(({ e }) => {
      const hay = [
        e.name,
        e.title,
        e.city,
        e.state,
        e.instructor,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(search);
    });
  }

  if (type !== 'all') {
    filtered = filtered.filter(({ e }) => e.type === type);
  }

  if (mode !== 'all') {
    filtered = filtered.filter(({ e }) => e.mode === mode);
  }

  if (status !== 'all') {
    filtered = filtered.filter(({ e }) => e.status === status);
  }

  if (dangerZone !== 'all') {
    filtered = filtered.filter(({ _risk }) => _risk === dangerZone);
  }

  if (fromDate) {
    filtered = filtered.filter(({ _isoDate }) => _isoDate && _isoDate.slice(0, 10) >= fromDate);
  }

  if (toDate) {
    filtered = filtered.filter(({ _isoDate }) => _isoDate && _isoDate.slice(0, 10) <= toDate);
  }

  // Sorting
  const dir = sortDir === 'desc' ? -1 : 1;
  filtered.sort((a, b) => {
    const ea = a.e;
    const eb = b.e;
    switch (sortBy) {
      case 'city':
        return (ea.city || '').localeCompare(eb.city || '') * dir;
      case 'state':
        return (ea.state || '').localeCompare(eb.state || '') * dir;
      case 'type':
        return (ea.type || '').localeCompare(eb.type || '') * dir;
      case 'mode':
        return (ea.mode || '').localeCompare(eb.mode || '') * dir;
      case 'status':
        return (ea.status || '').localeCompare(eb.status || '') * dir;
      case 'enrolled':
        return ((ea.enrolledStudents || 0) - (eb.enrolledStudents || 0)) * dir;
      case 'capacity':
        return ((ea.capacity || 0) - (eb.capacity || 0)) * dir;
      case 'risk':
        return (a._risk || '').localeCompare(b._risk || '') * dir;
      case 'date':
      default: {
        const da = (a._isoDate || '').slice(0, 10);
        const db = (b._isoDate || '').slice(0, 10);
        return da.localeCompare(db) * dir;
      }
    }
  });

  // Strip internal fields before responding
  const responseEvents = filtered.map(({ e }) => e);

  return NextResponse.json(responseEvents, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}