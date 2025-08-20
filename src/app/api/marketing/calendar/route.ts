import { NextRequest, NextResponse } from 'next/server';

interface CampaignEvent {
  id: string;
  title: string;
  type: 'email' | 'social' | 'webinar' | 'ad' | 'other';
  status: 'planned' | 'in_progress' | 'scheduled' | 'sent' | 'paused';
  owner: string;
  startDate: string;
  endDate: string;
  description?: string;
  channels: string[];
  tags?: string[];
  contentLink?: string;
  createdAt: string;
  updatedAt: string;
}

const MOCK_EVENTS: CampaignEvent[] = [
  {
    id: 'camp_001',
    title: 'Q4 Email Blast: Advanced Course Promo',
    type: 'email',
    status: 'scheduled',
    owner: 'marketing@org.com',
    startDate: '2025-08-22',
    endDate: '2025-08-22',
    description: 'Promoting Advanced course to engaged prospects',
    channels: ['email'],
    tags: ['advanced', 'email', 'promo'],
    contentLink: '/campaigns/q4-advanced-email',
    createdAt: '2025-08-01T10:00:00Z',
    updatedAt: '2025-08-10T14:30:00Z',
  },
  {
    id: 'camp_002',
    title: 'Social Campaign: Instructor Spotlight',
    type: 'social',
    status: 'in_progress',
    owner: 'social@org.com',
    startDate: '2025-08-15',
    endDate: '2025-08-25',
    description: 'Highlighting top instructors on LinkedIn and Instagram',
    channels: ['linkedin', 'instagram'],
    tags: ['instructor', 'social'],
    contentLink: '/campaigns/instructor-spotlight',
    createdAt: '2025-08-05T09:00:00Z',
    updatedAt: '2025-08-18T11:45:00Z',
  },
  {
    id: 'camp_003',
    title: 'Webinar: Upper Quadrant Techniques',
    type: 'webinar',
    status: 'planned',
    owner: 'events@org.com',
    startDate: '2025-09-10',
    endDate: '2025-09-10',
    description: 'Live webinar on advanced techniques',
    channels: ['zoom', 'email'],
    tags: ['webinar', 'upper quadrant'],
    contentLink: '/campaigns/webinar-upper-quadrant',
    createdAt: '2025-08-12T13:00:00Z',
    updatedAt: '2025-08-12T13:00:00Z',
  },
];

/**
 * GET /api/marketing/calendar
 * Returns all campaign events for the marketing calendar
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    const owner = url.searchParams.get('owner');

    let filtered = MOCK_EVENTS;

    if (type) {
      filtered = filtered.filter(e => e.type === type);
    }
    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }
    if (owner) {
      filtered = filtered.filter(e => e.owner === owner);
    }

    return NextResponse.json({
      events: filtered,
      total: filtered.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching marketing calendar:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marketing calendar' },
      { status: 500 },
    );
  }
}