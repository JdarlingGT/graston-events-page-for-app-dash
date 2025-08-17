import { NextResponse } from 'next/server';

// Mock detailed event data
const mockEventDetail = {
  id: "event-123",
  title: "Advanced React Patterns Workshop",
  description: "Deep dive into advanced React patterns including render props, higher-order components, compound components, and custom hooks. This intensive workshop will transform how you think about React architecture.",
  featuredImage: "https://picsum.photos/800/400?random=1",
  instructor: {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://picsum.photos/100/100?random=instructor",
    bio: "Sarah is a senior React developer with 8+ years of experience building scalable web applications. She's contributed to several open-source projects and speaks regularly at tech conferences."
  },
  venue: {
    name: "Tech Hub Downtown",
    address: "123 Innovation Drive",
    city: "San Francisco",
    state: "CA",
    capacity: 50
  },
  schedule: {
    startDate: "2024-03-15",
    endDate: "2024-03-17",
    startTime: "9:00 AM",
    endTime: "5:00 PM",
    timezone: "PST"
  },
  enrollment: {
    current: 23,
    capacity: 50,
    minViable: 15,
    waitlist: 3
  },
  pricing: {
    basePrice: 599,
    earlyBirdPrice: 499,
    revenue: 13770,
    projectedRevenue: 29950
  },
  type: "Advanced" as const,
  mode: "In-Person" as const,
  status: "published" as const,
  tags: ["React", "JavaScript", "Frontend", "Workshop"]
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json(mockEventDetail);
}