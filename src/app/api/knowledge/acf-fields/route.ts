import { NextResponse } from 'next/server';

const mockAcfFields = [
  { id: 'group_60d...a', name: 'Event Details', description: 'Contains fields for event capacity, schedule, venue information, and instructor.' },
  { id: 'group_61e...b', name: 'Course Information', description: 'Fields for pre-course materials, learning objectives, and required equipment.' },
  { id: 'group_62f...c', name: 'Venue Custom Fields', description: 'Custom fields for venue contact info, parking details, and AV capabilities.' },
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 350));
  return NextResponse.json(mockAcfFields);
}