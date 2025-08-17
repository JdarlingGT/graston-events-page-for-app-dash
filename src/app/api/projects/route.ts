import { NextResponse } from 'next/server';
import { projectSchema } from '@/lib/schemas';

// In-memory store for demo purposes
let mockProjects = [
  {
    "id": "proj-1",
    "name": "Q3 Marketing Campaign Launch",
    "description": "Coordinate all marketing efforts for the new product launch in Q3, including social media, email campaigns, and paid ads.",
    "memberAvatars": [
      "https://i.pravatar.cc/150?img=1",
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3"
    ],
    "progress": 75
  },
  {
    "id": "proj-2",
    "name": "Website Redesign",
    "description": "Complete overhaul of the main company website, focusing on improved UX, mobile responsiveness, and a modern design language.",
    "memberAvatars": [
      "https://i.pravatar.cc/150?img=4",
      "https://i.pravatar.cc/150?img=5"
    ],
    "progress": 40
  },
  {
    "id": "proj-3",
    "name": "New Instructor Onboarding Portal",
    "description": "Develop a new portal for instructors to manage their profiles, access resources, and view their teaching schedules.",
    "memberAvatars": [
      "https://i.pravatar.cc/150?img=6",
      "https://i.pravatar.cc/150?img=7",
      "https://i.pravatar.cc/150?img=8"
    ],
    "progress": 15
  }
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return NextResponse.json(mockProjects);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      ...validation.data,
      memberAvatars: [`https://i.pravatar.cc/150?u=${Date.now()}`],
      progress: 0,
    };

    mockProjects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}