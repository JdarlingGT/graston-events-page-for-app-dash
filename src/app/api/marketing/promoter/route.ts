import { NextRequest, NextResponse } from 'next/server';

interface CampaignPromotion {
  id: string;
  campaignId: string;
  type: 'email' | 'social';
  variant: 'A' | 'B';
  content: string;
  scheduledAt: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'sent';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const MOCK_PROMOTIONS: CampaignPromotion[] = [
  {
    id: 'promo_001',
    campaignId: 'camp_001',
    type: 'email',
    variant: 'A',
    content: 'Join our Advanced Course this fall and elevate your skills!',
    scheduledAt: '2025-08-22T10:00:00Z',
    status: 'scheduled',
    createdBy: 'marketing@org.com',
    createdAt: '2025-08-10T09:00:00Z',
    updatedAt: '2025-08-15T12:00:00Z',
  },
  {
    id: 'promo_002',
    campaignId: 'camp_001',
    type: 'email',
    variant: 'B',
    content: 'Don’t miss out on our top-rated Advanced Course – enroll now!',
    scheduledAt: '2025-08-22T14:00:00Z',
    status: 'pending_approval',
    createdBy: 'marketing@org.com',
    createdAt: '2025-08-10T09:30:00Z',
    updatedAt: '2025-08-15T12:00:00Z',
  },
  {
    id: 'promo_003',
    campaignId: 'camp_002',
    type: 'social',
    variant: 'A',
    content: 'Meet our top instructors and learn what makes them great. #InstructorSpotlight',
    scheduledAt: '2025-08-20T16:00:00Z',
    status: 'approved',
    createdBy: 'social@org.com',
    createdAt: '2025-08-12T11:00:00Z',
    updatedAt: '2025-08-16T10:00:00Z',
  },
];

/**
 * GET /api/marketing/promoter
 * Returns all campaign promotions
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');
    const status = url.searchParams.get('status');

    let filtered = MOCK_PROMOTIONS;

    if (campaignId) {
      filtered = filtered.filter(p => p.campaignId === campaignId);
    }
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    return NextResponse.json({
      promotions: filtered,
      total: filtered.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching campaign promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign promotions' },
      { status: 500 }
    );
  }
}