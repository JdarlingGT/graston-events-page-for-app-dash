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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const instructors = await getInstructors();
  const instructor = instructors.find((v: any) => v.id === params.id);

  if (!instructor) {
    return new NextResponse('Instructor not found', { status: 404 });
  }

  return NextResponse.json(instructor);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = instructorSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const instructors = await getInstructors();
    const instructorIndex = instructors.findIndex((v: any) => v.id === params.id);

    if (instructorIndex === -1) {
      return new NextResponse('Instructor not found', { status: 404 });
    }

    const updatedInstructor = {
      ...instructors[instructorIndex],
      ...validation.data,
    };
    instructors[instructorIndex] = updatedInstructor;

    await saveInstructors(instructors);

    return NextResponse.json(updatedInstructor);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const instructors = await getInstructors();
    const updatedInstructors = instructors.filter((v: any) => v.id !== params.id);

    if (instructors.length === updatedInstructors.length) {
      return new NextResponse('Instructor not found', { status: 404 });
    }

    await saveInstructors(updatedInstructors);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}