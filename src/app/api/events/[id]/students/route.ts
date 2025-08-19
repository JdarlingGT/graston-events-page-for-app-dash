import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const attendeesPath = path.join(jsonDirectory, 'attendees.json');

interface Attendee {
  attendeeId: string;
  eventId: string;
  name: string;
  email: string;
  status: 'Registered' | 'Attended' | 'No Show' | 'Cancelled';
}

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preCourseProgress: number;
  licenseType: string;
  registrationDate: string;
  lastLogin?: string;
  completedModules: string[];
  skillsAssessments: {
    id: string;
    name: string;
    score: number;
    completedAt: string;
  }[];
  notes?: string;
}

/**
 * Load attendees from mock data
 */
async function getAttendees(): Promise<Attendee[]> {
  try {
    const fileContents = await fs.readFile(attendeesPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read attendees data:', error);
    return [];
  }
}

/**
 * Generate mock student data with realistic details
 */
function generateStudentData(attendee: Attendee): Student {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'George', 'Hannah', 'Ian', 'Jessica'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez'];
  
  // Extract name parts for consistent generation
  const nameParts = attendee.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  
  // Generate consistent data based on name hash
  const nameHash = firstName.charCodeAt(0) + lastName.charCodeAt(0);
  const progressSeed = nameHash % 100;
  const licenseTypes = ['Professional', 'Student', 'Continuing Education', 'Certification'];
  
  // Generate realistic pre-course progress
  let preCourseProgress: number;
  if (progressSeed < 20) {
    preCourseProgress = Math.floor(Math.random() * 30); // 0-30% (behind)
  } else if (progressSeed < 70) {
    preCourseProgress = 60 + Math.floor(Math.random() * 30); // 60-90% (on track)
  } else {
    preCourseProgress = 90 + Math.floor(Math.random() * 11); // 90-100% (ahead)
  }
  
  // Generate completed modules based on progress
  const allModules = [
    'Introduction to Techniques',
    'Safety Protocols',
    'Anatomy Review',
    'Basic Applications',
    'Advanced Methods',
    'Case Studies',
    'Assessment Preparation'
  ];
  
  const completedCount = Math.floor((preCourseProgress / 100) * allModules.length);
  const completedModules = allModules.slice(0, completedCount);
  
  // Generate skills assessments
  const skillsAssessments = [
    {
      id: 'safety_quiz',
      name: 'Safety Protocol Quiz',
      score: 75 + Math.floor(Math.random() * 25), // 75-100%
      completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'anatomy_test',
      name: 'Anatomy Knowledge Test',
      score: 60 + Math.floor(Math.random() * 40), // 60-100%
      completedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ].filter(() => preCourseProgress > 50); // Only include if student is making progress
  
  return {
    id: attendee.attendeeId,
    name: attendee.name,
    email: attendee.email,
    avatar: `https://i.pravatar.cc/150?u=${attendee.email}`,
    preCourseProgress,
    licenseType: licenseTypes[nameHash % licenseTypes.length],
    registrationDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLogin: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    completedModules,
    skillsAssessments,
    notes: Math.random() > 0.7 ? 'Previous attendee with excellent performance' : undefined,
  };
}

/**
 * GET /api/events/[id]/students
 * Get all students registered for a specific event with detailed information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const attendees = await getAttendees();
    
    // Filter attendees for this specific event
    const eventAttendees = attendees.filter(attendee => attendee.eventId === eventId);
    
    if (eventAttendees.length === 0) {
      return NextResponse.json([]);
    }
    
    // Convert attendees to detailed student objects
    const students = eventAttendees.map(generateStudentData);
    
    // Sort by name for consistent ordering
    students.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json(students, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching event students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event students' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/students
 * Add a new student to the event or update existing student information
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const studentData = await request.json();
    
    // Validate required fields
    if (!studentData.name || !studentData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const attendees = await getAttendees();
    
    // Check if student already exists for this event
    const existingIndex = attendees.findIndex(
      a => a.eventId === eventId && a.email === studentData.email
    );
    
    if (existingIndex >= 0) {
      // Update existing attendee
      attendees[existingIndex] = {
        ...attendees[existingIndex],
        name: studentData.name,
        status: studentData.status || attendees[existingIndex].status,
      };
    } else {
      // Add new attendee
      const newAttendee: Attendee = {
        attendeeId: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId,
        name: studentData.name,
        email: studentData.email,
        status: studentData.status || 'Registered',
      };
      attendees.push(newAttendee);
    }
    
    // Save updated attendees (in a real app, this would update the database)
    await fs.writeFile(attendeesPath, JSON.stringify(attendees, null, 2));
    
    // Return the updated student list for this event
    const eventAttendees = attendees.filter(attendee => attendee.eventId === eventId);
    const students = eventAttendees.map(generateStudentData);
    students.sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json(students);
  } catch (error) {
    console.error('Error adding/updating student:', error);
    return NextResponse.json(
      { error: 'Failed to add/update student' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]/students
 * Bulk update student information (useful for roster management)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const updates = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Expected array of student updates' },
        { status: 400 }
      );
    }
    
    const attendees = await getAttendees();
    
    // Apply updates
    for (const update of updates) {
      const attendeeIndex = attendees.findIndex(
        a => a.eventId === eventId && a.attendeeId === update.id
      );
      
      if (attendeeIndex >= 0) {
        attendees[attendeeIndex] = {
          ...attendees[attendeeIndex],
          ...update,
          eventId, // Ensure eventId doesn't change
        };
      }
    }
    
    // Save updated attendees
    await fs.writeFile(attendeesPath, JSON.stringify(attendees, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      updated: updates.length,
      message: `Updated ${updates.length} student records`
    });
  } catch (error) {
    console.error('Error bulk updating students:', error);
    return NextResponse.json(
      { error: 'Failed to update students' },
      { status: 500 }
    );
  }
}