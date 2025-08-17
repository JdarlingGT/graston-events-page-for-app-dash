import { NextResponse } from 'next/server';

const mockForms = [
  { id: 7, name: 'Contact Us', description: 'General contact form on the main website.' },
  { id: 12, name: 'Event Inquiry', description: 'Used on event pages for specific questions about an event.' },
  { id: 15, name: 'Instructor Application', description: 'Form for potential new instructors to apply.' },
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 250));
  return NextResponse.json(mockForms);
}