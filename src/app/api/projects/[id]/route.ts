import { NextResponse } from 'next/server';

const mockProjects = [
  {
    'id': 'proj-1',
    'name': 'Q3 Marketing Campaign Launch',
    'description': 'Coordinate all marketing efforts for the new product launch in Q3, including social media, email campaigns, and paid ads.',
    'memberAvatars': [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
    ],
    'progress': 75,
  },
  {
    'id': 'proj-2',
    'name': 'Website Redesign',
    'description': 'Complete overhaul of the main company website, focusing on improved UX, mobile responsiveness, and a modern design language.',
    'memberAvatars': [
      'https://i.pravatar.cc/150?img=4',
      'https://i.pravatar.cc/150?img=5',
    ],
    'progress': 40,
  },
  {
    'id': 'proj-3',
    'name': 'New Instructor Onboarding Portal',
    'description': 'Develop a new portal for instructors to manage their profiles, access resources, and view their teaching schedules.',
    'memberAvatars': [
      'https://i.pravatar.cc/150?img=6',
      'https://i.pravatar.cc/150?img=7',
      'https://i.pravatar.cc/150?img=8',
    ],
    'progress': 15,
  },
];

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const project = mockProjects.find(p => p.id === params.id);
  if (!project) {
    return new NextResponse('Project not found', { status: 404 });
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  return NextResponse.json(project);
}