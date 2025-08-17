import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'checkins.json');

async function getCheckIns() {
  try {
    await fs.access(filePath);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return {}; // Return empty object if file doesn't exist or is empty
  }
}

async function saveCheckIns(data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// GET check-in data for an event
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const allCheckIns = await getCheckIns();
  const eventCheckIns = allCheckIns[params.id] || {};
  return NextResponse.json(eventCheckIns);
}

// POST to update a student's check-in status
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { studentId, period, timestamp } = await request.json();
  if (!studentId || !period || !timestamp) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const allCheckIns = await getCheckIns();
  if (!allCheckIns[params.id]) {
    allCheckIns[params.id] = {};
  }
  if (!allCheckIns[params.id][studentId]) {
    allCheckIns[params.id][studentId] = {};
  }

  allCheckIns[params.id][studentId][period] = timestamp;

  await saveCheckIns(allCheckIns);

  return NextResponse.json({ success: true, data: allCheckIns[params.id][studentId] });
}