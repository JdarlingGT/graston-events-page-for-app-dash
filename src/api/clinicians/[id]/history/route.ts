import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');

async function readJsonFile(filePath: string) {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const clinicians = await readJsonFile(path.join(jsonDirectory, 'clinicians.json'));
  const clinician = clinicians.find((c: any) => c.id === params.id);

  if (!clinician) {
    return new NextResponse('Clinician not found', { status: 404 });
  }

  // In a real app, this would be a more complex query.
  // For now, we'll return a mock history.
  const mockHistory = [
    { eventId: '25995731', eventName: 'Essential Training | Austin, TX', date: '2024-05-15', status: 'Completed' },
    { eventId: '26012317', eventName: 'Advanced Workshop | New York, NY', date: '2023-11-20', status: 'Completed' },
  ];

  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(mockHistory);
}