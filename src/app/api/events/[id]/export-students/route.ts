import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    // Simulate data processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock CSV data
    const csvData = `Name,Email,License Number,Provider Type,License State,Date Purchased,Pre-Course Progress
Alice Johnson,alice.johnson@email.com,RN123456789,Registered Nurse,CA,2024-01-15,100%
Bob Smith,bob.smith@email.com,MD987654321,Medical Doctor,NY,2024-01-18,65%
Carol Davis,carol.davis@email.com,NP456789123,Nurse Practitioner,TX,2024-01-20,30%
David Wilson,david.wilson@email.com,PA789123456,Physician Assistant,FL,2024-01-22,100%
Emma Brown,emma.brown@email.com,RN321654987,Registered Nurse,WA,2024-01-25,85%`;
    
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="event-${params.id}-students.csv"`,
      },
    });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}