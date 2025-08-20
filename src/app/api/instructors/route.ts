import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { instructorSchema, instructorFiltersSchema } from '@/lib/schemas/instructor';
import { Instructor, InstructorListResponse, InstructorStats } from '@/types/instructor';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'instructors.json');

// Enhanced mock data with full instructor objects
const generateMockInstructors = (): Instructor[] => [
  {
    id: 'inst_01',
    name: 'Dr. Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Dr. Smith is a leading expert in soft tissue mobilization and has been a certified Graston Technique instructor for over 10 years. She specializes in sports medicine and rehabilitation.',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    specialties: ['Soft Tissue Mobilization', 'Sports Medicine', 'Rehabilitation'],
    certifications: [
      {
        id: 'cert_01',
        name: 'Graston Technique M1',
        issuingOrganization: 'Graston Technique LLC',
        issueDate: new Date('2020-01-15'),
        expiryDate: new Date('2025-01-15'),
        verified: true,
      },
      {
        id: 'cert_02',
        name: 'Advanced Sports Medicine',
        issuingOrganization: 'ACSM',
        issueDate: new Date('2019-06-20'),
        verified: true,
      },
    ],
    teachingHistory: [],
    resources: [],
    availability: {
      id: 'avail_01',
      instructorId: 'inst_01',
      timezone: 'America/New_York',
      weeklySchedule: {
        monday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        wednesday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        thursday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        friday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
        saturday: { available: false, breaks: [] },
        sunday: { available: false, breaks: [] },
      },
      blackoutDates: [],
      preferredLocations: ['New York', 'Boston', 'Philadelphia'],
      maxEventsPerMonth: 8,
    },
    performanceMetrics: {
      id: 'metrics_01',
      instructorId: 'inst_01',
      totalEventsInstructed: 45,
      totalStudentsTrained: 680,
      averageStudentRating: 4.8,
      completionRate: 94.5,
      averageClassSize: 15.1,
      recentPerformance: [],
      lastUpdated: new Date(),
    },
    status: 'active',
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'inst_02',
    name: 'Dr. Michael Clark',
    email: 'michael.clark@example.com',
    phone: '+1 (555) 234-5678',
    bio: 'With a background in sports medicine, Dr. Clark specializes in athletic injuries and performance enhancement using GT. He has worked with professional athletes and Olympic teams.',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    specialties: ['Athletic Performance', 'Injury Prevention', 'Olympic Training'],
    certifications: [
      {
        id: 'cert_03',
        name: 'Graston Technique M1',
        issuingOrganization: 'Graston Technique LLC',
        issueDate: new Date('2018-03-10'),
        expiryDate: new Date('2024-03-10'),
        verified: true,
      },
    ],
    teachingHistory: [],
    resources: [],
    availability: {
      id: 'avail_02',
      instructorId: 'inst_02',
      timezone: 'America/Chicago',
      weeklySchedule: {
        monday: { available: true, startTime: '08:00', endTime: '16:00', breaks: [] },
        tuesday: { available: true, startTime: '08:00', endTime: '16:00', breaks: [] },
        wednesday: { available: true, startTime: '08:00', endTime: '16:00', breaks: [] },
        thursday: { available: true, startTime: '08:00', endTime: '16:00', breaks: [] },
        friday: { available: true, startTime: '08:00', endTime: '16:00', breaks: [] },
        saturday: { available: true, startTime: '09:00', endTime: '13:00', breaks: [] },
        sunday: { available: false, breaks: [] },
      },
      blackoutDates: [],
      preferredLocations: ['Chicago', 'Milwaukee', 'Indianapolis'],
      maxEventsPerMonth: 10,
    },
    performanceMetrics: {
      id: 'metrics_02',
      instructorId: 'inst_02',
      totalEventsInstructed: 38,
      totalStudentsTrained: 520,
      averageStudentRating: 4.6,
      completionRate: 91.2,
      averageClassSize: 13.7,
      recentPerformance: [],
      lastUpdated: new Date(),
    },
    status: 'active',
    createdAt: new Date('2018-06-15'),
    updatedAt: new Date(),
  },
  {
    id: 'inst_03',
    name: 'Dr. Emily White',
    email: 'emily.white@example.com',
    phone: '+1 (555) 345-6789',
    bio: 'Dr. White\'s research focuses on the neurological effects of instrument-assisted soft tissue mobilization. She brings cutting-edge research to practical application.',
    avatar: 'https://images.unsplash.com/photo-1594824388853-d0c2d8e8b6b8?w=150&h=150&fit=crop&crop=face',
    specialties: ['Neurological Rehabilitation', 'Research', 'Clinical Applications'],
    certifications: [
      {
        id: 'cert_04',
        name: 'Graston Technique M1',
        issuingOrganization: 'Graston Technique LLC',
        issueDate: new Date('2019-09-05'),
        expiryDate: new Date('2024-09-05'),
        verified: true,
      },
      {
        id: 'cert_05',
        name: 'Neurological Rehabilitation Specialist',
        issuingOrganization: 'APTA',
        issueDate: new Date('2017-11-12'),
        verified: true,
      },
    ],
    teachingHistory: [],
    resources: [],
    availability: {
      id: 'avail_03',
      instructorId: 'inst_03',
      timezone: 'America/Los_Angeles',
      weeklySchedule: {
        monday: { available: true, startTime: '10:00', endTime: '18:00', breaks: [] },
        tuesday: { available: true, startTime: '10:00', endTime: '18:00', breaks: [] },
        wednesday: { available: false, breaks: [] },
        thursday: { available: true, startTime: '10:00', endTime: '18:00', breaks: [] },
        friday: { available: true, startTime: '10:00', endTime: '18:00', breaks: [] },
        saturday: { available: false, breaks: [] },
        sunday: { available: false, breaks: [] },
      },
      blackoutDates: [],
      preferredLocations: ['Los Angeles', 'San Francisco', 'Seattle'],
      maxEventsPerMonth: 6,
    },
    performanceMetrics: {
      id: 'metrics_03',
      instructorId: 'inst_03',
      totalEventsInstructed: 28,
      totalStudentsTrained: 420,
      averageStudentRating: 4.9,
      completionRate: 96.8,
      averageClassSize: 15.0,
      recentPerformance: [],
      lastUpdated: new Date(),
    },
    status: 'active',
    createdAt: new Date('2019-03-20'),
    updatedAt: new Date(),
  },
];

async function getInstructors(): Promise<Instructor[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // If the file contains simple instructor objects, enhance them
    if (data.length > 0 && !data[0].performanceMetrics) {
      return generateMockInstructors();
    }
    
    return data;
  } catch (error) {
    console.error('Failed to read instructors data:', error);
    // Return mock data if file doesn't exist
    return generateMockInstructors();
  }
}

async function saveInstructors(instructors: Instructor[]) {
  try {
    await fs.writeFile(filePath, JSON.stringify(instructors, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save instructors data:', error);
    throw new Error('Could not save instructor data.');
  }
}

function applyFilters(instructors: Instructor[], filters: any): Instructor[] {
  let filtered = [...instructors];

  // Search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(instructor =>
      instructor.name.toLowerCase().includes(searchTerm) ||
      instructor.email.toLowerCase().includes(searchTerm) ||
      instructor.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm)
      )
    );
  }

  // Status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(instructor => 
      filters.status.includes(instructor.status)
    );
  }

  // Specialties filter
  if (filters.specialties && filters.specialties.length > 0) {
    filtered = filtered.filter(instructor =>
      filters.specialties.some((specialty: string) =>
        instructor.specialties.includes(specialty)
      )
    );
  }

  // Rating filter
  if (filters.rating) {
    filtered = filtered.filter(instructor =>
      instructor.performanceMetrics?.averageStudentRating >= filters.rating
    );
  }

  // Location filter
  if (filters.location) {
    filtered = filtered.filter(instructor =>
      instructor.availability?.preferredLocations.some(location =>
        location.toLowerCase().includes(filters.location.toLowerCase())
      )
    );
  }

  return filtered;
}

function sortInstructors(instructors: Instructor[], sortBy: string, sortOrder: string): Instructor[] {
  return instructors.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'rating':
        aValue = a.performanceMetrics?.averageStudentRating || 0;
        bValue = b.performanceMetrics?.averageStudentRating || 0;
        break;
      case 'experience':
        aValue = a.performanceMetrics?.totalEventsInstructed || 0;
        bValue = b.performanceMetrics?.totalEventsInstructed || 0;
        break;
      case 'recent':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate filters
    const filters = {
      search: searchParams.get('search') || '',
      specialties: searchParams.getAll('specialties'),
      status: searchParams.getAll('status'),
      availability: searchParams.get('availability') || undefined,
      location: searchParams.get('location') || '',
      certifications: searchParams.getAll('certifications'),
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      sortBy: searchParams.get('sortBy') || 'name',
      sortOrder: searchParams.get('sortOrder') || 'asc',
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
    };

    // Validate filters
    const validatedFilters = instructorFiltersSchema.parse(filters);

    // Get all instructors
    const allInstructors = await getInstructors();

    // Apply filters
    let filteredInstructors = applyFilters(allInstructors, validatedFilters);

    // Apply sorting
    filteredInstructors = sortInstructors(filteredInstructors, validatedFilters.sortBy, validatedFilters.sortOrder);

    // Apply pagination
    const total = filteredInstructors.length;
    const startIndex = (validatedFilters.page - 1) * validatedFilters.limit;
    const endIndex = startIndex + validatedFilters.limit;
    const paginatedInstructors = filteredInstructors.slice(startIndex, endIndex);

    const response: InstructorListResponse = {
      instructors: paginatedInstructors,
      total,
      page: validatedFilters.page,
      limit: validatedFilters.limit,
      hasMore: endIndex < total,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('GET /api/instructors error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = instructorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid instructor data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const instructors = await getInstructors();
    const newInstructor: Instructor = {
      id: `inst-${Date.now()}`,
      ...validation.data,
      certifications: [],
      teachingHistory: [],
      resources: [],
      availability: {
        id: `avail-${Date.now()}`,
        instructorId: `inst-${Date.now()}`,
        timezone: 'America/New_York',
        weeklySchedule: {
          monday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          tuesday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          wednesday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          thursday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          friday: { available: true, startTime: '09:00', endTime: '17:00', breaks: [] },
          saturday: { available: false, breaks: [] },
          sunday: { available: false, breaks: [] },
        },
        blackoutDates: [],
        preferredLocations: [],
        maxEventsPerMonth: 8,
      },
      performanceMetrics: {
        id: `metrics-${Date.now()}`,
        instructorId: `inst-${Date.now()}`,
        totalEventsInstructed: 0,
        totalStudentsTrained: 0,
        averageStudentRating: 0,
        completionRate: 0,
        averageClassSize: 0,
        recentPerformance: [],
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    instructors.push(newInstructor);
    await saveInstructors(instructors);

    return NextResponse.json(newInstructor, { status: 201 });
  } catch (error) {
    console.error('POST /api/instructors error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}