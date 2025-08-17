import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { instructorSchema } from '@/lib/schemas';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'instructors.json');

async function getInstructors() {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read instructors data:', error);
    return [];
  }
}

async function saveInstructors(instructors: any) {
  try {
    await fs.writeFile(filePath, JSON.stringify(instructors, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save instructors data:', error);
    throw new Error('Could not save instructor data.');
  }
}

export async function GET() {
  const instructors = await getInstructors();
  return NextResponse.json(instructors);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = instructorSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const instructors = await getInstructors();
    const newInstructor = {
      id: `inst-${Date.now()}`,
      ...validation.data,
    };

    instructors.push(newInstructor);
    await saveInstructors(instructors);

    return NextResponse.json(newInstructor, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}