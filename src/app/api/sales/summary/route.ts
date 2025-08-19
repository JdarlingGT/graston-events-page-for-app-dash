import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const eventsPath = path.join(jsonDirectory, 'events.json');
const attendeesPath = path.join(jsonDirectory, 'attendees.json');

interface Event {
  id: string;
  name: string;
  city: string;
  state: string;
  enrolledStudents: number;
  capacity: number;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: 'In-Person' | 'Virtual' | 'Hybrid';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date?: string;
  startDate?: string;
  price?: number;
}

interface SalesMetrics {
  totalRevenue: number;
  totalEvents: number;
  totalStudents: number;
  averageEventSize: number;
  averageTicketPrice: number;
  conversionRate: number;
  revenueGrowth: number;
  topPerformingCourseType: string;
  topPerformingRegion: string;
}

interface RegionalPerformance {
  region: string;
  state: string;
  totalEvents: number;
  totalRevenue: number;
  totalStudents: number;
  averageEventSize: number;
  conversionRate: number;
  marketPenetration: number;
}

interface CourseTypePerformance {
  courseType: string;
  totalEvents: number;
  totalRevenue: number;
  totalStudents: number;
  averagePrice: number;
  fillRate: number;
  profitMargin: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  events: number;
  students: number;
  averageTicketPrice: number;
  conversionRate: number;
}

interface SalesSummary {
  overview: SalesMetrics;
  regionalPerformance: RegionalPerformance[];
  courseTypePerformance: CourseTypePerformance[];
  monthlyTrends: MonthlyTrend[];
  topOpportunities: {
    underperformingRegions: RegionalPerformance[];
    lowCapacityEvents: Event[];
    highDemandAreas: RegionalPerformance[];
  };
  generatedAt: string;
}

/**
 * Load events and attendees data
 */
async function loadSalesData(): Promise<{ events: Event[]; attendees: any[] }> {
  try {
    const [eventsData, attendeesData] = await Promise.all([
      fs.readFile(eventsPath, 'utf8').then(data => JSON.parse(data)),
      fs.readFile(attendeesPath, 'utf8').then(data => JSON.parse(data))
    ]);
    
    return { events: eventsData, attendees: attendeesData };
  } catch (error) {
    console.error('Failed to load sales data:', error);
    return { events: [], attendees: [] };
  }
}

/**
 * Calculate comprehensive sales metrics
 */
function calculateSalesMetrics(events: Event[], attendees: any[]): SalesMetrics {
  const completedEvents = events.filter(e => e.status === 'completed');
  const totalStudents = completedEvents.reduce((sum, e) => sum + e.enrolledStudents, 0);
  
  // Mock pricing data (in real app, this would come from the database)
  const courseTypePricing = {
    'Essential': 299,
    'Advanced': 499,
    'Upper Quadrant': 799,
  };
  
  const totalRevenue = completedEvents.reduce((sum, event) => {
    const price = courseTypePricing[event.type] || 399;
    return sum + (event.enrolledStudents * price);
  }, 0);
  
  const totalCapacity = completedEvents.reduce((sum, e) => sum + e.capacity, 0);
  const conversionRate = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
  
  // Calculate growth (mock comparison with previous period)
  const previousRevenue = totalRevenue * 0.85; // Simulate 15% growth
  const revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
  
  // Find top performing course type
  const courseTypeRevenue = completedEvents.reduce((acc, event) => {
    const price = courseTypePricing[event.type] || 399;
    const revenue = event.enrolledStudents * price;
    acc[event.type] = (acc[event.type] || 0) + revenue;
    return acc;
  }, {} as Record<string, number>);
  
  const topPerformingCourseType = Object.entries(courseTypeRevenue)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Essential';
  
  // Find top performing region
  const regionRevenue = completedEvents.reduce((acc, event) => {
    const price = courseTypePricing[event.type] || 399;
    const revenue = event.enrolledStudents * price;
    acc[event.state] = (acc[event.state] || 0) + revenue;
    return acc;
  }, {} as Record<string, number>);
  
  const topPerformingRegion = Object.entries(regionRevenue)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  
  return {
    totalRevenue,
    totalEvents: completedEvents.length,
    totalStudents,
    averageEventSize: completedEvents.length > 0 ? totalStudents / completedEvents.length : 0,
    averageTicketPrice: totalStudents > 0 ? totalRevenue / totalStudents : 0,
    conversionRate,
    revenueGrowth,
    topPerformingCourseType,
    topPerformingRegion,
  };
}

/**
 * Calculate regional performance metrics
 */
function calculateRegionalPerformance(events: Event[]): RegionalPerformance[] {
  const completedEvents = events.filter(e => e.status === 'completed');
  const courseTypePricing = {
    'Essential': 299,
    'Advanced': 499,
    'Upper Quadrant': 799,
  };
  
  const regionStats = completedEvents.reduce((acc, event) => {
    const state = event.state;
    if (!acc[state]) {
      acc[state] = {
        totalEvents: 0,
        totalRevenue: 0,
        totalStudents: 0,
        totalCapacity: 0,
      };
    }
    
    const price = courseTypePricing[event.type] || 399;
    const revenue = event.enrolledStudents * price;
    
    acc[state].totalEvents += 1;
    acc[state].totalRevenue += revenue;
    acc[state].totalStudents += event.enrolledStudents;
    acc[state].totalCapacity += event.capacity;
    
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(regionStats).map(([state, stats]) => ({
    region: `${state} Region`,
    state,
    totalEvents: stats.totalEvents,
    totalRevenue: stats.totalRevenue,
    totalStudents: stats.totalStudents,
    averageEventSize: stats.totalEvents > 0 ? stats.totalStudents / stats.totalEvents : 0,
    conversionRate: stats.totalCapacity > 0 ? (stats.totalStudents / stats.totalCapacity) * 100 : 0,
    marketPenetration: Math.min(100, (stats.totalEvents / 10) * 100), // Mock market penetration
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Calculate course type performance
 */
function calculateCourseTypePerformance(events: Event[]): CourseTypePerformance[] {
  const completedEvents = events.filter(e => e.status === 'completed');
  const courseTypePricing = {
    'Essential': 299,
    'Advanced': 499,
    'Upper Quadrant': 799,
  };
  
  const courseStats = completedEvents.reduce((acc, event) => {
    const type = event.type;
    if (!acc[type]) {
      acc[type] = {
        totalEvents: 0,
        totalRevenue: 0,
        totalStudents: 0,
        totalCapacity: 0,
      };
    }
    
    const price = courseTypePricing[type] || 399;
    const revenue = event.enrolledStudents * price;
    
    acc[type].totalEvents += 1;
    acc[type].totalRevenue += revenue;
    acc[type].totalStudents += event.enrolledStudents;
    acc[type].totalCapacity += event.capacity;
    
    return acc;
  }, {} as Record<string, any>);
  
  return Object.entries(courseStats).map(([courseType, stats]) => ({
    courseType,
    totalEvents: stats.totalEvents,
    totalRevenue: stats.totalRevenue,
    totalStudents: stats.totalStudents,
    averagePrice: courseTypePricing[courseType as keyof typeof courseTypePricing] || 399,
    fillRate: stats.totalCapacity > 0 ? (stats.totalStudents / stats.totalCapacity) * 100 : 0,
    profitMargin: 65, // Mock profit margin
  })).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Generate monthly trends (mock data for demonstration)
 */
function generateMonthlyTrends(): MonthlyTrend[] {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map((month, index) => {
    const baseRevenue = 50000 + (index * 5000) + (Math.random() * 10000);
    const events = 8 + Math.floor(Math.random() * 6);
    const students = 120 + Math.floor(Math.random() * 80);
    
    return {
      month,
      revenue: Math.round(baseRevenue),
      events,
      students,
      averageTicketPrice: Math.round(baseRevenue / students),
      conversionRate: 70 + Math.random() * 20,
    };
  });
}

/**
 * Identify top opportunities
 */
function identifyOpportunities(
  events: Event[], 
  regionalPerformance: RegionalPerformance[]
) {
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  
  return {
    underperformingRegions: regionalPerformance
      .filter(r => r.conversionRate < 60)
      .slice(0, 3),
    lowCapacityEvents: upcomingEvents
      .filter(e => (e.enrolledStudents / e.capacity) < 0.5)
      .slice(0, 5),
    highDemandAreas: regionalPerformance
      .filter(r => r.conversionRate > 80)
      .slice(0, 3),
  };
}

/**
 * GET /api/sales/summary
 * Comprehensive sales analytics and KPIs
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'all'; // all, ytd, last30, last90
    const includeForecasts = url.searchParams.get('forecasts') === 'true';
    
    const { events, attendees } = await loadSalesData();
    
    // Filter events based on timeframe
    let filteredEvents = events;
    if (timeframe !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (timeframe) {
        case 'ytd':
          cutoffDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'last30':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last90':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date || event.startDate || '');
        return eventDate >= cutoffDate;
      });
    }
    
    const overview = calculateSalesMetrics(filteredEvents, attendees);
    const regionalPerformance = calculateRegionalPerformance(filteredEvents);
    const courseTypePerformance = calculateCourseTypePerformance(filteredEvents);
    const monthlyTrends = generateMonthlyTrends();
    const topOpportunities = identifyOpportunities(events, regionalPerformance);
    
    const summary: SalesSummary = {
      overview,
      regionalPerformance,
      courseTypePerformance,
      monthlyTrends,
      topOpportunities,
      generatedAt: new Date().toISOString(),
    };
    
    // Add forecasts if requested
    if (includeForecasts) {
      const forecasts = {
        nextQuarterRevenue: overview.totalRevenue * 1.15,
        projectedGrowthRate: overview.revenueGrowth * 1.1,
        recommendedCapacityIncrease: 15,
        targetMarkets: regionalPerformance.slice(0, 3).map(r => r.state),
      };
      
      (summary as any).forecasts = forecasts;
    }
    
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error generating sales summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate sales summary' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales/summary
 * Trigger manual sales data refresh and recalculation
 */
export async function POST(request: NextRequest) {
  try {
    const { forceRefresh = false } = await request.json();
    
    // In a real implementation, this would:
    // 1. Refresh data from WooCommerce
    // 2. Sync with CRM systems
    // 3. Update cached calculations
    // 4. Trigger any dependent reports
    
    console.log('Manual sales data refresh triggered', { forceRefresh });
    
    // Simulate refresh process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json({
      success: true,
      message: 'Sales data refresh completed',
      refreshedAt: new Date().toISOString(),
      recordsProcessed: {
        events: 150,
        attendees: 2500,
        transactions: 1800,
      },
    });
  } catch (error) {
    console.error('Error refreshing sales data:', error);
    return NextResponse.json(
      { error: 'Failed to refresh sales data' },
      { status: 500 }
    );
  }
}