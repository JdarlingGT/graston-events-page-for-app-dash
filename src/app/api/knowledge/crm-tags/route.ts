import { NextResponse } from 'next/server';

const mockTags = [
  { id: 1, name: 'New Student', description: 'Applied to all new student sign-ups via WooCommerce.' },
  { id: 2, name: 'Essential Course', description: 'Tag for students enrolled in any Essential course.' },
  { id: 3, name: 'Advanced Course', description: 'Tag for students enrolled in any Advanced course.' },
  { id: 4, name: 'GTU Lead', description: 'Lead from the "Graston Technique University" funnel.' },
  { id: 5, name: 'Instrument Purchase', description: 'Student purchased an instrument kit.' },
  { id: 6, name: 'Waitlist', description: 'Contact is on a waitlist for a full event.' },
];

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 300));
  return NextResponse.json(mockTags);
}