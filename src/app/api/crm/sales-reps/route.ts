import { NextResponse } from 'next/server';

// Mock Sales Rep data
const mockSalesReps = [
  {
    id: 'rep-1',
    name: 'Michael Scott',
    avatar: 'https://i.pravatar.cc/150?img=68',
    assignedLeads: 120,
    conversions: 15,
    pipelineValue: 75000,
  },
  {
    id: 'rep-2',
    name: 'Dwight Schrute',
    avatar: 'https://i.pravatar.cc/150?img=69',
    assignedLeads: 90,
    conversions: 22,
    pipelineValue: 110000,
  },
  {
    id: 'rep-3',
    name: 'Pam Beesly',
    avatar: 'https://i.pravatar.cc/150?img=70',
    assignedLeads: 150,
    conversions: 10,
    pipelineValue: 50000,
  },
  {
    id: 'rep-4',
    name: 'Jim Halpert',
    avatar: 'https://i.pravatar.cc/150?img=71',
    assignedLeads: 110,
    conversions: 18,
    pipelineValue: 90000,
  },
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return NextResponse.json(mockSalesReps, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800',
    },
  });
}