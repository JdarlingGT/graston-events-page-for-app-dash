import { NextResponse } from 'next/server';

// Mock data for attendees
const attendees = [
  { id: 'att-1', eventId: 'evt-123', name: 'Alice Johnson', email: 'alice@example.com', registrationDate: '2024-05-01', kitPurchased: true },
  { id: 'att-2', eventId: 'evt-123', name: 'Bob Williams', email: 'bob@example.com', registrationDate: '2024-05-03', kitPurchased: false },
  { id: 'att-3', eventId: 'evt-123', name: 'Charlie Brown', email: 'charlie@example.com', registrationDate: '2024-05-05', kitPurchased: true },
  { id: 'att-4', eventId: 'evt-456', name: 'Diana Prince', email: 'diana@example.com', registrationDate: '2024-06-10', kitPurchased: true },
  { id: 'att-5', eventId: 'evt-456', name: 'Ethan Hunt', email: 'ethan@example.com', registrationDate: '2024-06-12', kitPurchased: true },
  { id: 'att-6', eventId: 'evt-789', name: 'Fiona Glenanne', email: 'fiona@example.com', registrationDate: '2024-07-20', kitPurchased: false },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  const eventAttendees = attendees.filter(att => att.eventId === eventId);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(eventAttendees);
}