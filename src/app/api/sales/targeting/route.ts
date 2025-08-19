import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const eventsPath = path.join(jsonDirectory, 'events.json');
const attendeesPath = path.join(jsonDirectory, 'attendees.json');

interface TargetingCriteria {
  geoRadius?: {
    centerLat: number;
    centerLng: number;
    radiusMiles: number;
  };
  courseTypes?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  priceRange?: {
    min: number;
    max: number;
  };
  timeframe?: {
    startDate: string;
    endDate: string;
  };
  excludeRecentAttendees?: boolean;
  minEngagementScore?: number;
}

interface TargetLocation {
  city: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
  marketPenetration: number;
  competitorDensity: number;
  averageIncome: number;
  healthcareProfessionals: number;
}

interface EngagementProfile {
  email: string;
  name?: string;
  engagementScore: number;
  lastInteraction: string;
  interactions: {
    emailOpens: number;
    emailClicks: number;
    websiteVisits: number;
    eventAttendance: number;
    socialEngagement: number;
  };
  preferences: {
    courseTypes: string[];
    preferredLocations: string[];
    priceRange: string;
    communicationFrequency: 'low' | 'medium' | 'high';
  };
  nextLevelEligibility: {
    eligible: boolean;
    recommendedCourse?: string;
    readinessScore: number;
  };
}

interface TargetingRecommendation {
  priority: 'high' | 'medium' | 'low';
  location: TargetLocation;
  estimatedAttendees: number;
  recommendedCourseType: string;
  recommendedPrice: number;
  marketingChannels: string[];
  expectedROI: number;
  competitiveAdvantage: string[];
  risks: string[];
}

interface TargetingResults {
  criteria: TargetingCriteria;
  totalTargetableProspects: number;
  highValueProspects: EngagementProfile[];
  locationRecommendations: TargetingRecommendation[];
  marketInsights: {
    underservedMarkets: TargetLocation[];
    saturatedMarkets: TargetLocation[];
    emergingOpportunities: TargetLocation[];
  };
  campaignSuggestions: {
    emailCampaigns: Array<{
      name: string;
      targetSegment: string;
      estimatedReach: number;
      expectedConversion: number;
    }>;
    geographicExpansion: Array<{
      market: string;
      opportunity: string;
      investmentRequired: number;
      projectedRevenue: number;
    }>;
  };
  generatedAt: string;
}

// Mock data for demonstration
const MOCK_LOCATIONS: TargetLocation[] = [
  {
    city: 'Austin',
    state: 'TX',
    lat: 30.2672,
    lng: -97.7431,
    population: 978908,
    marketPenetration: 15,
    competitorDensity: 3,
    averageIncome: 75000,
    healthcareProfessionals: 12500,
  },
  {
    city: 'Denver',
    state: 'CO',
    lat: 39.7392,
    lng: -104.9903,
    population: 715522,
    marketPenetration: 8,
    competitorDensity: 2,
    averageIncome: 78000,
    healthcareProfessionals: 9800,
  },
  {
    city: 'Nashville',
    state: 'TN',
    lat: 36.1627,
    lng: -86.7816,
    population: 689447,
    marketPenetration: 5,
    competitorDensity: 1,
    averageIncome: 65000,
    healthcareProfessionals: 8200,
  },
  {
    city: 'Phoenix',
    state: 'AZ',
    lat: 33.4484,
    lng: -112.0740,
    population: 1608139,
    marketPenetration: 12,
    competitorDensity: 4,
    averageIncome: 62000,
    healthcareProfessionals: 18500,
  },
  {
    city: 'Portland',
    state: 'OR',
    lat: 45.5152,
    lng: -122.6784,
    population: 652503,
    marketPenetration: 18,
    competitorDensity: 3,
    averageIncome: 71000,
    healthcareProfessionals: 11200,
  },
];

/**
 * Generate mock engagement profiles
 */
function generateEngagementProfiles(count: number = 100): EngagementProfile[] {
  const profiles: EngagementProfile[] = [];
  const courseTypes = ['Essential', 'Advanced', 'Upper Quadrant'];
  const locations = ['Austin, TX', 'Denver, CO', 'Nashville, TN', 'Phoenix, AZ', 'Portland, OR'];
  
  for (let i = 0; i < count; i++) {
    const emailOpens = Math.floor(Math.random() * 50);
    const emailClicks = Math.floor(emailOpens * 0.3);
    const websiteVisits = Math.floor(Math.random() * 20);
    const eventAttendance = Math.floor(Math.random() * 5);
    const socialEngagement = Math.floor(Math.random() * 30);
    
    // Calculate engagement score (0-100)
    const engagementScore = Math.min(100, 
      (emailOpens * 2) + 
      (emailClicks * 5) + 
      (websiteVisits * 3) + 
      (eventAttendance * 20) + 
      (socialEngagement * 1)
    );
    
    const hasAdvancedExperience = eventAttendance > 0;
    const readinessScore = Math.min(100, engagementScore + (hasAdvancedExperience ? 20 : 0));
    
    profiles.push({
      email: `prospect${i + 1}@example.com`,
      name: `Prospect ${i + 1}`,
      engagementScore,
      lastInteraction: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      interactions: {
        emailOpens,
        emailClicks,
        websiteVisits,
        eventAttendance,
        socialEngagement,
      },
      preferences: {
        courseTypes: courseTypes.filter(() => Math.random() > 0.5),
        preferredLocations: locations.filter(() => Math.random() > 0.7),
        priceRange: ['$200-400', '$400-600', '$600-800'][Math.floor(Math.random() * 3)],
        communicationFrequency: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      },
      nextLevelEligibility: {
        eligible: readinessScore > 60,
        recommendedCourse: hasAdvancedExperience ? 'Upper Quadrant' : 'Advanced',
        readinessScore,
      },
    });
  }
  
  return profiles.sort((a, b) => b.engagementScore - a.engagementScore);
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Filter locations by geographic criteria
 */
function filterLocationsByGeo(locations: TargetLocation[], criteria: TargetingCriteria): TargetLocation[] {
  if (!criteria.geoRadius) return locations;
  
  const { centerLat, centerLng, radiusMiles } = criteria.geoRadius;
  
  return locations.filter(location => {
    const distance = calculateDistance(centerLat, centerLng, location.lat, location.lng);
    return distance <= radiusMiles;
  });
}

/**
 * Generate targeting recommendations
 */
function generateTargetingRecommendations(
  locations: TargetLocation[], 
  criteria: TargetingCriteria
): TargetingRecommendation[] {
  return locations.map(location => {
    // Calculate priority based on market penetration, competition, and demographics
    const opportunityScore = 
      (100 - location.marketPenetration) * 0.4 +
      (5 - location.competitorDensity) * 20 * 0.3 +
      (location.averageIncome / 1000) * 0.3;
    
    const priority: 'high' | 'medium' | 'low' = 
      opportunityScore > 70 ? 'high' : 
      opportunityScore > 50 ? 'medium' : 'low';
    
    // Estimate attendees based on healthcare professionals and market penetration
    const estimatedAttendees = Math.floor(
      (location.healthcareProfessionals * 0.02) * (1 - location.marketPenetration / 100)
    );
    
    // Recommend course type based on market maturity
    const recommendedCourseType = 
      location.marketPenetration < 10 ? 'Essential' :
      location.marketPenetration < 20 ? 'Advanced' : 'Upper Quadrant';
    
    // Price recommendation based on average income
    const recommendedPrice = 
      location.averageIncome > 70000 ? 499 :
      location.averageIncome > 60000 ? 399 : 299;
    
    // Marketing channels based on demographics and competition
    const marketingChannels = [
      'Google Ads',
      'Facebook/Instagram',
      location.competitorDensity < 2 ? 'Local Partnerships' : 'Content Marketing',
      location.averageIncome > 65000 ? 'LinkedIn' : 'Email Marketing',
    ].filter(Boolean);
    
    // Expected ROI calculation
    const expectedRevenue = estimatedAttendees * recommendedPrice;
    const estimatedCosts = expectedRevenue * 0.4; // 40% cost ratio
    const expectedROI = ((expectedRevenue - estimatedCosts) / estimatedCosts) * 100;
    
    return {
      priority,
      location,
      estimatedAttendees,
      recommendedCourseType,
      recommendedPrice,
      marketingChannels,
      expectedROI,
      competitiveAdvantage: [
        location.competitorDensity < 2 ? 'Low competition' : 'Established market',
        location.marketPenetration < 15 ? 'Untapped market potential' : 'Market validation',
        `${location.healthcareProfessionals.toLocaleString()} healthcare professionals`,
      ],
      risks: [
        location.competitorDensity > 3 ? 'High competition' : null,
        location.marketPenetration > 25 ? 'Market saturation risk' : null,
        location.averageIncome < 55000 ? 'Price sensitivity' : null,
      ].filter(Boolean) as string[],
    };
  }).sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * GET /api/sales/targeting
 * Intelligent sales targeting with geo-radius and engagement scoring
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    
    // Parse targeting criteria from query parameters
    const criteria: TargetingCriteria = {};
    
    // Geographic targeting
    const centerLat = url.searchParams.get('centerLat');
    const centerLng = url.searchParams.get('centerLng');
    const radiusMiles = url.searchParams.get('radiusMiles');
    
    if (centerLat && centerLng && radiusMiles) {
      criteria.geoRadius = {
        centerLat: parseFloat(centerLat),
        centerLng: parseFloat(centerLng),
        radiusMiles: parseInt(radiusMiles),
      };
    }
    
    // Course type filtering
    const courseTypes = url.searchParams.get('courseTypes');
    if (courseTypes) {
      criteria.courseTypes = courseTypes.split(',');
    }
    
    // Experience level
    const experienceLevel = url.searchParams.get('experienceLevel') as any;
    if (experienceLevel) {
      criteria.experienceLevel = experienceLevel;
    }
    
    // Price range
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      criteria.priceRange = {
        min: parseInt(minPrice),
        max: parseInt(maxPrice),
      };
    }
    
    // Engagement threshold
    const minEngagementScore = url.searchParams.get('minEngagementScore');
    if (minEngagementScore) {
      criteria.minEngagementScore = parseInt(minEngagementScore);
    }
    
    // Generate engagement profiles
    const allProfiles = generateEngagementProfiles(500);
    
    // Filter profiles based on criteria
    let filteredProfiles = allProfiles;
    
    if (criteria.minEngagementScore) {
      filteredProfiles = filteredProfiles.filter(p => p.engagementScore >= criteria.minEngagementScore!);
    }
    
    if (criteria.courseTypes) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.preferences.courseTypes.some(ct => criteria.courseTypes!.includes(ct))
      );
    }
    
    // Get high-value prospects (top 20%)
    const highValueProspects = filteredProfiles.slice(0, Math.ceil(filteredProfiles.length * 0.2));
    
    // Filter locations by geographic criteria
    const targetLocations = filterLocationsByGeo(MOCK_LOCATIONS, criteria);
    
    // Generate recommendations
    const locationRecommendations = generateTargetingRecommendations(targetLocations, criteria);
    
    // Market insights
    const marketInsights = {
      underservedMarkets: MOCK_LOCATIONS.filter(l => l.marketPenetration < 10),
      saturatedMarkets: MOCK_LOCATIONS.filter(l => l.marketPenetration > 25),
      emergingOpportunities: MOCK_LOCATIONS.filter(l => 
        l.marketPenetration < 15 && l.competitorDensity < 3 && l.averageIncome > 60000
      ),
    };
    
    // Campaign suggestions
    const campaignSuggestions = {
      emailCampaigns: [
        {
          name: 'High-Engagement Nurture',
          targetSegment: 'Prospects with 70+ engagement score',
          estimatedReach: highValueProspects.filter(p => p.engagementScore >= 70).length,
          expectedConversion: 15,
        },
        {
          name: 'Next-Level Advancement',
          targetSegment: 'Previous attendees eligible for advanced courses',
          estimatedReach: filteredProfiles.filter(p => p.nextLevelEligibility.eligible).length,
          expectedConversion: 25,
        },
        {
          name: 'Geographic Expansion',
          targetSegment: 'Prospects in underserved markets',
          estimatedReach: Math.floor(filteredProfiles.length * 0.3),
          expectedConversion: 8,
        },
      ],
      geographicExpansion: locationRecommendations.slice(0, 3).map(rec => ({
        market: `${rec.location.city}, ${rec.location.state}`,
        opportunity: `${rec.estimatedAttendees} potential attendees`,
        investmentRequired: rec.estimatedAttendees * rec.recommendedPrice * 0.4,
        projectedRevenue: rec.estimatedAttendees * rec.recommendedPrice,
      })),
    };
    
    const results: TargetingResults = {
      criteria,
      totalTargetableProspects: filteredProfiles.length,
      highValueProspects,
      locationRecommendations,
      marketInsights,
      campaignSuggestions,
      generatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Error generating targeting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate targeting recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales/targeting
 * Create a new targeting campaign based on criteria
 */
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      criteria,
      targetLocations,
      estimatedBudget,
      expectedDuration,
    } = await request.json();
    
    if (!name || !criteria) {
      return NextResponse.json(
        { error: 'Campaign name and targeting criteria are required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would:
    // 1. Save the campaign to the database
    // 2. Set up tracking pixels and UTM parameters
    // 3. Create audience segments in advertising platforms
    // 4. Schedule email campaigns
    // 5. Generate marketing materials
    
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const campaign = {
      id: campaignId,
      name,
      criteria,
      targetLocations,
      estimatedBudget,
      expectedDuration,
      status: 'draft',
      createdAt: new Date().toISOString(),
      estimatedReach: Math.floor(Math.random() * 1000) + 500,
      projectedROI: 150 + Math.floor(Math.random() * 100),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Targeting campaign created successfully',
      campaign,
    });
  } catch (error) {
    console.error('Error creating targeting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create targeting campaign' },
      { status: 500 }
    );
  }
}