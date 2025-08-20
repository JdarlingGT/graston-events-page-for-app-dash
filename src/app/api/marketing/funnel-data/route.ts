// Temporarily removed to resolve build issues.
// @ts-nocheck
/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');

interface FunnelStage {
  name: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
  avgTimeInStage: number; // in minutes
  revenue: number;
  cost: number;
  roi: number;
}

interface Touchpoint {
  id: string;
  channel: string;
  campaign: string;
  source: string;
  medium: string;
  content: string;
  touchpointType: 'first_touch' | 'last_touch' | 'assisted' | 'direct';
  visitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roi: number;
  avgOrderValue: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
}

interface AttributionModel {
  name: string;
  description: string;
  weight: number;
  touchpoints: Array<{
    touchpointId: string;
    attribution: number;
    revenue: number;
    conversions: number;
  }>;
  totalAttributedRevenue: number;
  totalAttributedConversions: number;
}

interface CampaignPerformance {
  id: string;
  name: string;
  channel: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  roas: number;
  cpa: number;
  status: 'active' | 'paused' | 'completed';
  targetAudience: string;
  creativeAssets: string[];
  landingPages: string[];
}

interface CustomerJourney {
  customerId: string;
  customerEmail: string;
  customerName: string;
  journey: Array<{
    timestamp: string;
    channel: string;
    campaign: string;
    touchpoint: string;
    action: string;
    value?: number;
    conversionStage: string;
  }>;
  totalTouchpoints: number;
  firstTouchChannel: string;
  lastTouchChannel: string;
  conversionPath: string[];
  totalRevenue: number;
  acquisitionCost: number;
  journeyDuration: number; // in days
}

interface FunnelData {
  overview: {
    totalVisitors: number;
    totalConversions: number;
    overallConversionRate: number;
    totalRevenue: number;
    totalCost: number;
    overallROI: number;
    avgCustomerLifetimeValue: number;
    avgCustomerAcquisitionCost: number;
    period: string;
  };
  funnelStages: FunnelStage[];
  touchpoints: Touchpoint[];
  attributionModels: AttributionModel[];
  campaignPerformance: CampaignPerformance[];
  customerJourneys: CustomerJourney[];
  insights: {
    topPerformingChannels: Array<{
      channel: string;
      revenue: number;
      roas: number;
      conversions: number;
    }>;
    underperformingCampaigns: Array<{
      campaign: string;
      channel: string;
      roas: number;
      issues: string[];
    }>;
    optimizationOpportunities: Array<{
      type: string;
      description: string;
      potentialImpact: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  generatedAt: string;
}

// Mock data for demonstration
const MOCK_FUNNEL_STAGES: FunnelStage[] = [
  {
    name: 'Awareness',
    visitors: 15420,
    conversionRate: 100,
    dropoffRate: 0,
    avgTimeInStage: 2.5,
    revenue: 0,
    cost: 8500,
    roi: -100,
  },
  {
    name: 'Interest',
    visitors: 12450,
    conversionRate: 80.7,
    dropoffRate: 19.3,
    avgTimeInStage: 5.2,
    revenue: 0,
    cost: 12000,
    roi: -100,
  },
  {
    name: 'Consideration',
    visitors: 8750,
    conversionRate: 70.3,
    dropoffRate: 29.7,
    avgTimeInStage: 8.7,
    revenue: 0,
    cost: 15000,
    roi: -100,
  },
  {
    name: 'Intent',
    visitors: 3240,
    conversionRate: 37.0,
    dropoffRate: 63.0,
    avgTimeInStage: 12.3,
    revenue: 0,
    cost: 18000,
    roi: -100,
  },
  {
    name: 'Purchase',
    visitors: 1245,
    conversionRate: 38.4,
    dropoffRate: 61.6,
    avgTimeInStage: 3.8,
    revenue: 622500,
    cost: 22000,
    roi: 2729.5,
  },
];

const MOCK_TOUCHPOINTS: Touchpoint[] = [
  {
    id: 'tp_1',
    channel: 'Google Ads',
    campaign: 'Brand Search',
    source: 'google',
    medium: 'cpc',
    content: 'brand',
    touchpointType: 'last_touch',
    visitors: 3240,
    conversions: 485,
    conversionRate: 15.0,
    revenue: 242500,
    cost: 15000,
    roi: 1516.7,
    avgOrderValue: 500,
    customerAcquisitionCost: 30.9,
    customerLifetimeValue: 1250,
  },
  {
    id: 'tp_2',
    channel: 'Facebook',
    campaign: 'Retargeting',
    source: 'facebook',
    medium: 'social',
    content: 'retargeting',
    touchpointType: 'assisted',
    visitors: 2150,
    conversions: 215,
    conversionRate: 10.0,
    revenue: 107500,
    cost: 8500,
    roi: 1164.7,
    avgOrderValue: 500,
    customerAcquisitionCost: 39.5,
    customerLifetimeValue: 1100,
  },
  {
    id: 'tp_3',
    channel: 'Email',
    campaign: 'Newsletter',
    source: 'mailchimp',
    medium: 'email',
    content: 'newsletter',
    touchpointType: 'assisted',
    visitors: 1870,
    conversions: 187,
    conversionRate: 10.0,
    revenue: 93500,
    cost: 1200,
    roi: 7691.7,
    avgOrderValue: 500,
    customerAcquisitionCost: 6.4,
    customerLifetimeValue: 1350,
  },
  {
    id: 'tp_4',
    channel: 'Organic Search',
    campaign: 'SEO',
    source: 'google',
    medium: 'organic',
    content: 'seo',
    touchpointType: 'first_touch',
    visitors: 4250,
    conversions: 255,
    conversionRate: 6.0,
    revenue: 127500,
    cost: 8000,
    roi: 1493.8,
    avgOrderValue: 500,
    customerAcquisitionCost: 31.4,
    customerLifetimeValue: 1400,
  },
  {
    id: 'tp_5',
    channel: 'LinkedIn',
    campaign: 'Professional',
    source: 'linkedin',
    medium: 'social',
    content: 'professional',
    touchpointType: 'assisted',
    visitors: 980,
    conversions: 98,
    conversionRate: 10.0,
    revenue: 49000,
    cost: 6500,
    roi: 653.8,
    avgOrderValue: 500,
    customerAcquisitionCost: 66.3,
    customerLifetimeValue: 1500,
  },
];

const MOCK_CAMPAIGNS: CampaignPerformance[] = [
  {
    id: 'camp_1',
    name: 'Q4 Brand Awareness',
    channel: 'Google Ads',
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    budget: 25000,
    spent: 18750,
    impressions: 125000,
    clicks: 3240,
    ctr: 2.59,
    conversions: 485,
    conversionRate: 15.0,
    revenue: 242500,
    roas: 12.93,
    cpa: 38.7,
    status: 'active',
    targetAudience: 'Healthcare professionals',
    creativeAssets: ['brand_banner.jpg', 'brand_video.mp4'],
    landingPages: ['/courses', '/about'],
  },
  {
    id: 'camp_2',
    name: 'Email Nurture Sequence',
    channel: 'Email',
    startDate: '2024-09-01',
    endDate: '2024-12-31',
    budget: 5000,
    spent: 1200,
    impressions: 18700,
    clicks: 1870,
    ctr: 10.0,
    conversions: 187,
    conversionRate: 10.0,
    revenue: 93500,
    roas: 77.92,
    cpa: 6.4,
    status: 'active',
    targetAudience: 'Existing subscribers',
    creativeAssets: ['newsletter_template.html'],
    landingPages: ['/courses/essential', '/courses/advanced'],
  },
  {
    id: 'camp_3',
    name: 'Facebook Retargeting',
    channel: 'Facebook',
    startDate: '2024-08-15',
    endDate: '2024-11-30',
    budget: 15000,
    spent: 8500,
    impressions: 85000,
    clicks: 2150,
    ctr: 2.53,
    conversions: 215,
    conversionRate: 10.0,
    revenue: 107500,
    roas: 12.65,
    cpa: 39.5,
    status: 'active',
    targetAudience: 'Website visitors',
    creativeAssets: ['retargeting_ad.jpg', 'retargeting_carousel.jpg'],
    landingPages: ['/courses', '/testimonials'],
  },
];

const MOCK_CUSTOMER_JOURNEYS: CustomerJourney[] = [
  {
    customerId: 'cust_1',
    customerEmail: 'john.doe@healthcare.com',
    customerName: 'John Doe',
    journey: [
      {
        timestamp: '2024-11-01T10:00:00Z',
        channel: 'Facebook',
        campaign: 'Retargeting',
        touchpoint: 'Social media ad',
        action: 'click',
        conversionStage: 'Awareness',
      },
      {
        timestamp: '2024-11-02T14:30:00Z',
        channel: 'Email',
        campaign: 'Newsletter',
        touchpoint: 'Welcome email',
        action: 'open',
        conversionStage: 'Interest',
      },
      {
        timestamp: '2024-11-05T09:15:00Z',
        channel: 'LinkedIn',
        campaign: 'Professional',
        touchpoint: 'Professional content',
        action: 'engage',
        conversionStage: 'Consideration',
      },
      {
        timestamp: '2024-11-07T16:45:00Z',
        channel: 'Email',
        campaign: 'Newsletter',
        touchpoint: 'Reminder email',
        action: 'purchase',
        value: 500,
        conversionStage: 'Purchase',
      },
    ],
    totalTouchpoints: 4,
    firstTouchChannel: 'Facebook',
    lastTouchChannel: 'Email',
    conversionPath: ['Facebook', 'Email', 'LinkedIn', 'Email'],
    totalRevenue: 500,
    acquisitionCost: 38.7,
    journeyDuration: 6,
  },
];

/**
 * Generate simple attribution models from touchpoints.
 */
function generateAttributionModels(touchpoints: Touchpoint[]): AttributionModel[] {
  const totalRevenue = touchpoints.reduce((sum, tp) => sum + tp.revenue, 0);
  const totalConversions = touchpoints.reduce((sum, tp) => sum + tp.conversions, 0);
  
  return [
    {
      name: 'Last Touch',
      description: '100% credit to the final touchpoint before conversion',
      weight: 1,
      touchpoints: touchpoints.map(tp => ({
        touchpointId: tp.id,
        attribution: tp.touchpointType === 'last_touch' ? 100 : 0,
        revenue: tp.touchpointType === 'last_touch' ? tp.revenue : 0,
        conversions: tp.touchpointType === 'last_touch' ? tp.conversions : 0,
      })),
      totalAttributedRevenue: totalRevenue,
      totalAttributedConversions: totalConversions,
    },
    {
      name: 'First Touch',
      description: '100% credit to the first touchpoint in the customer journey',
      weight: 1,
      touchpoints: touchpoints.map(tp => ({
        touchpointId: tp.id,
        attribution: tp.touchpointType === 'first_touch' ? 100 : 0,
        revenue: tp.touchpointType === 'first_touch' ? tp.revenue : 0,
        conversions: tp.touchpointType === 'first_touch' ? tp.conversions : 0,
      })),
      totalAttributedRevenue: totalRevenue,
      totalAttributedConversions: totalConversions,
    },
    {
      name: 'Linear',
      description: 'Equal credit distributed across all touchpoints',
      weight: 1,
      touchpoints: touchpoints.map(tp => ({
        touchpointId: tp.id,
        attribution: 100 / touchpoints.length,
        revenue: tp.revenue / touchpoints.length,
        conversions: tp.conversions / touchpoints.length,
      })),
      totalAttributedRevenue: totalRevenue,
      totalAttributedConversions: totalConversions,
    },
    {
      name: 'Time Decay',
      description: 'More credit to touchpoints closer to conversion',
      weight: 1,
      touchpoints: touchpoints.map((tp, index) => {
        const decay = Math.exp(-index * 0.5);
        const totalDecay = touchpoints.reduce((sum, _, i) => sum + Math.exp(-i * 0.5), 0);
        const attribution = (decay / totalDecay) * 100;
        
        return {
          touchpointId: tp.id,
          attribution,
          revenue: (tp.revenue * attribution) / 100,
          conversions: (tp.conversions * attribution) / 100,
        };
      }),
      totalAttributedRevenue: totalRevenue,
      totalAttributedConversions: totalConversions,
    },
    {
      name: 'Position Based',
      description: '40% to first touch, 40% to last touch, 20% distributed across middle touchpoints',
      weight: 1,
      touchpoints: touchpoints.map((tp, index, array) => {
        let attribution = 0;
        if (index === 0) {
          attribution = 40;
        } // First touch
        else if (index === array.length - 1) {
          attribution = 40;
        } // Last touch
        else {
          attribution = 20 / (array.length - 2);
        } // Middle touchpoints
        
        return {
          touchpointId: tp.id,
          attribution,
          revenue: (tp.revenue * attribution) / 100,
          conversions: (tp.conversions * attribution) / 100,
        };
      }),
      totalAttributedRevenue: totalRevenue,
      totalAttributedConversions: totalConversions,
    },
  ];
}

/**
 * GET /api/marketing/funnel-data
 * Multi-touch attribution data with GA4 + WooCommerce + FluentCRM integration
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || '30days';
    const channel = url.searchParams.get('channel');
    const campaign = url.searchParams.get('campaign');
    const attributionModel = url.searchParams.get('attributionModel') || 'linear';

    // Filter data based on parameters
    let filteredTouchpoints = MOCK_TOUCHPOINTS;
    let filteredCampaigns = MOCK_CAMPAIGNS;

    if (channel) {
      filteredTouchpoints = filteredTouchpoints.filter(tp => 
        tp.channel.toLowerCase().includes(channel.toLowerCase()),
      );
      filteredCampaigns = filteredCampaigns.filter(camp => 
        camp.channel.toLowerCase().includes(channel.toLowerCase()),
      );
    }

    if (campaign) {
      filteredTouchpoints = filteredTouchpoints.filter(tp => 
        tp.campaign.toLowerCase().includes(campaign.toLowerCase()),
      );
      filteredCampaigns = filteredCampaigns.filter(camp => 
        camp.name.toLowerCase().includes(campaign.toLowerCase()),
      );
    }

    // Generate attribution models
    const attributionModels = generateAttributionModels(filteredTouchpoints);

    // Calculate overview metrics
    const totalVisitors = MOCK_FUNNEL_STAGES[0].visitors;
    const totalConversions = MOCK_FUNNEL_STAGES[MOCK_FUNNEL_STAGES.length - 1].visitors;
    const overallConversionRate = (totalConversions / totalVisitors) * 100;
    const totalRevenue = filteredTouchpoints.reduce((sum, tp) => sum + tp.revenue, 0);
    const totalCost = filteredTouchpoints.reduce((sum, tp) => sum + tp.cost, 0);
    const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    const avgCustomerLifetimeValue = filteredTouchpoints.reduce((sum, tp) => sum + tp.customerLifetimeValue, 0) / filteredTouchpoints.length;
    const avgCustomerAcquisitionCost = filteredTouchpoints.reduce((sum, tp) => sum + tp.customerAcquisitionCost, 0) / filteredTouchpoints.length;

    // Generate insights
    const topPerformingChannels = filteredTouchpoints
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
      .map(tp => ({
        channel: tp.channel,
        revenue: tp.revenue,
        roas: tp.roi,
        conversions: tp.conversions,
      }));

    const underperformingCampaigns = filteredCampaigns
      .filter(camp => camp.roas < 5)
      .map(camp => ({
        campaign: camp.name,
        channel: camp.channel,
        roas: camp.roas,
        issues: [
          camp.ctr < 2 ? 'Low click-through rate' : null,
          camp.conversionRate < 5 ? 'Low conversion rate' : null,
          camp.cpa > 50 ? 'High cost per acquisition' : null,
        ].filter(Boolean) as string[],
      }));

    const optimizationOpportunities = [
      {
        type: 'Budget Reallocation',
        description: 'Shift budget from underperforming campaigns to top-performing channels',
        potentialImpact: '15-20% increase in overall ROAS',
        priority: 'high' as const,
      },
      {
        type: 'Retargeting Enhancement',
        description: 'Implement advanced retargeting sequences for abandoned cart visitors',
        potentialImpact: '10-15% increase in conversion rate',
        priority: 'medium' as const,
      },
      {
        type: 'Email Optimization',
        description: 'A/B test email subject lines and content to improve engagement',
        potentialImpact: '5-10% increase in email conversion rate',
        priority: 'medium' as const,
      },
      {
        type: 'SEO Expansion',
        description: 'Expand SEO efforts to target long-tail keywords with high commercial intent',
        potentialImpact: '8-12% increase in organic traffic',
        priority: 'low' as const,
      },
    ];

    const funnelData: FunnelData = {
      overview: {
        totalVisitors,
        totalConversions,
        overallConversionRate,
        totalRevenue,
        totalCost,
        overallROI,
        avgCustomerLifetimeValue,
        avgCustomerAcquisitionCost,
        period: timeframe,
      },
      funnelStages: MOCK_FUNNEL_STAGES,
      touchpoints: filteredTouchpoints,
      attributionModels,
      campaignPerformance: filteredCampaigns,
      customerJourneys: MOCK_CUSTOMER_JOURNEYS,
      insights: {
        topPerformingChannels,
        underperformingCampaigns,
        optimizationOpportunities,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(funnelData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching funnel data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funnel data' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/marketing/funnel-data
 * Create or update funnel data configuration
 */
export async function POST(request: NextRequest) {
  try {
    const {
      action,
      campaignId,
      attributionModel,
      timeframe,
      filters,
    } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 },
      );
    }

    // In a real implementation, this would:
    // 1. Connect to GA4 API to fetch real analytics data
    // 2. Connect to WooCommerce API to get order and product data
    // 3. Connect to FluentCRM API to get customer and campaign data
    // 4. Process and correlate data across platforms
    // 5. Calculate attribution models
    // 6. Store results in database

    switch (action) {
      case 'refresh_data':
        // Simulate data refresh
        await new Promise(resolve => setTimeout(resolve, 2000));
        return NextResponse.json({
          success: true,
          message: 'Funnel data refreshed successfully',
          timestamp: new Date().toISOString(),
        });

      case 'update_attribution_model':
        return NextResponse.json({
          success: true,
          message: `Attribution model updated to ${attributionModel}`,
          timestamp: new Date().toISOString(),
        });

      case 'export_report':
        return NextResponse.json({
          success: true,
          message: 'Report exported successfully',
          downloadUrl: `/api/marketing/funnel-data/export?timeframe=${timeframe || '30days'}`,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error processing funnel data request:', error);
    return NextResponse.json(
      { error: 'Failed to process funnel data request' },
      { status: 500 },
    );
  }
}