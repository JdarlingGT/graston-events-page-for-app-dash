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

export async function GET() {
  const clinicians = await getClinicians();
  return NextResponse.json(clinicians);
}