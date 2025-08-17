import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'clinicians.json');

async function getClinicians() {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read clinicians data:', error);
    return [];
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const clinicians = await getClinicians();
  const clinician = clinicians.find((c: any) => c.id === params.id);

  if (!clinician) {
    return new NextResponse('Clinician not found', { status: 404 });
  }

  return NextResponse.json(clinician);
}