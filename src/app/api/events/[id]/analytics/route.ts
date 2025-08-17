import { NextResponse } from 'next/server';

// Mock analytics data
const generateMockAnalytics = (eventId: string, range: string) => {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  
  const enrollmentTrend = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    return {
      date: date.toISOString().split('T')[0],
      enrolled: Math.floor(Math.random() * 50) + i * 2,
      target: 60,
      revenue: Math.floor(Math.random() * 5000) + i * 100,
    };
  });

  const conversionFunnel = [
    { stage: "Page Views", value: 12500, fill: "#8884d8" },
    { stage: "Event Clicks", value: 3200, fill: "#82ca9d" },
    { stage: "Registration Started", value: 1800, fill: "#ffc658" },
    { stage: "Payment Completed", value: 850, fill: "#ff7300" },
    { stage: "Course Enrolled", value: 780, fill: "#00ff00" },
  ];

  const trafficSources = [
    { source: "Google Ads", visitors: 4500, conversions: 320, revenue: 45000 },
    { source: "Facebook", visitors: 3200, conversions: 180, revenue: 28000 },
    { source: "Email Campaign", visitors: 2800, conversions: 420, revenue: 52000 },
    { source: "Direct", visitors: 1900, conversions: 95, revenue: 15000 },
    { source: "Referral", visitors: 1200, conversions: 85, revenue: 12000 },
  ];

  const demographics = [
    { category: "Registered Nurses", value: 45, fill: "#0088FE" },
    { category: "Medical Doctors", value: 25, fill: "#00C49F" },
    { category: "Nurse Practitioners", value: 20, fill: "#FFBB28" },
    { category: "Physician Assistants", value: 10, fill: "#FF8042" },
  ];

  const performance = {
    totalViews: 12500,
    clickThroughRate: 25.6,
    conversionRate: 6.8,
    averageOrderValue: 599,
    customerLifetimeValue: 1250,
    refundRate: 2.3,
  };

  return {
    enrollmentTrend,
    conversionFunnel,
    trafficSources,
    demographics,
    performance,
  };
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const analytics = generateMockAnalytics(params.id, range);
  
  return NextResponse.json(analytics);
}