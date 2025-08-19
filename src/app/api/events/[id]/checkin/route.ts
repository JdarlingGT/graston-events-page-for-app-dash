import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const checkinsPath = path.join(jsonDirectory, 'checkins.json');

interface CheckInRecord {
  morningIn?: string;
  lunchOut?: string;
  lunchIn?: string;
  afternoonOut?: string;
}

interface CheckInData {
  [eventId: string]: {
    [studentId: string]: CheckInRecord;
  };
}

interface CheckInRequest {
  studentId: string;
  period: keyof CheckInRecord;
  timestamp: string;
}

interface AttendanceSummary {
  studentId: string;
  studentName?: string;
  totalHours: number;
  periods: {
    morning: { checkedIn: boolean; duration?: number };
    lunch: { checkedOut: boolean; checkedIn: boolean; duration?: number };
    afternoon: { checkedOut: boolean; duration?: number };
  };
  attendancePercentage: number;
  status: 'present' | 'partial' | 'absent';
}

/**
 * Load check-in data from mock storage
 */
async function getCheckInData(): Promise<CheckInData> {
  try {
    const fileContents = await fs.readFile(checkinsPath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read check-in data:', error);
    return {};
  }
}

/**
 * Save check-in data to mock storage
 */
async function saveCheckInData(data: CheckInData): Promise<void> {
  try {
    await fs.writeFile(checkinsPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save check-in data:', error);
    throw error;
  }
}

/**
 * Calculate attendance summary for a student
 */
function calculateAttendanceSummary(studentId: string, record: CheckInRecord, studentName?: string): AttendanceSummary {
  const summary: AttendanceSummary = {
    studentId,
    studentName,
    totalHours: 0,
    periods: {
      morning: { checkedIn: false },
      lunch: { checkedOut: false, checkedIn: false },
      afternoon: { checkedOut: false },
    },
    attendancePercentage: 0,
    status: 'absent',
  };

  // Morning session (9 AM - 12 PM = 3 hours)
  if (record.morningIn) {
    summary.periods.morning.checkedIn = true;
    const morningStart = new Date(record.morningIn);
    const lunchTime = record.lunchOut ? new Date(record.lunchOut) : new Date(morningStart.getTime() + 3 * 60 * 60 * 1000);
    summary.periods.morning.duration = Math.max(0, (lunchTime.getTime() - morningStart.getTime()) / (1000 * 60 * 60));
    summary.totalHours += summary.periods.morning.duration;
  }

  // Lunch break tracking
  if (record.lunchOut) {
    summary.periods.lunch.checkedOut = true;
  }
  if (record.lunchIn) {
    summary.periods.lunch.checkedIn = true;
    if (record.lunchOut) {
      const lunchStart = new Date(record.lunchOut);
      const lunchEnd = new Date(record.lunchIn);
      summary.periods.lunch.duration = (lunchEnd.getTime() - lunchStart.getTime()) / (1000 * 60 * 60);
    }
  }

  // Afternoon session (1 PM - 5 PM = 4 hours)
  if (record.lunchIn || record.afternoonOut) {
    const afternoonStart = record.lunchIn ? new Date(record.lunchIn) : 
                          record.morningIn ? new Date(new Date(record.morningIn).getTime() + 4 * 60 * 60 * 1000) : 
                          new Date();
    const afternoonEnd = record.afternoonOut ? new Date(record.afternoonOut) : 
                        new Date(afternoonStart.getTime() + 4 * 60 * 60 * 1000);
    
    if (record.afternoonOut) {
      summary.periods.afternoon.checkedOut = true;
    }
    
    const afternoonDuration = Math.max(0, (afternoonEnd.getTime() - afternoonStart.getTime()) / (1000 * 60 * 60));
    summary.totalHours += afternoonDuration;
  }

  // Calculate attendance percentage (assuming 7-hour day)
  const expectedHours = 7;
  summary.attendancePercentage = Math.min(100, (summary.totalHours / expectedHours) * 100);

  // Determine status
  if (summary.attendancePercentage >= 80) {
    summary.status = 'present';
  } else if (summary.attendancePercentage >= 20) {
    summary.status = 'partial';
  } else {
    summary.status = 'absent';
  }

  return summary;
}

/**
 * GET /api/events/[id]/checkin
 * Get check-in data for all students in an event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const url = new URL(request.url);
    const format = url.searchParams.get('format'); // 'summary' for attendance summary
    
    const checkInData = await getCheckInData();
    const eventCheckIns = checkInData[eventId] || {};

    if (format === 'summary') {
      // Return attendance summary for all students
      const summaries: AttendanceSummary[] = [];
      
      for (const [studentId, record] of Object.entries(eventCheckIns)) {
        const summary = calculateAttendanceSummary(studentId, record);
        summaries.push(summary);
      }

      // Sort by attendance percentage (highest first)
      summaries.sort((a, b) => b.attendancePercentage - a.attendancePercentage);

      return NextResponse.json({
        eventId,
        totalStudents: summaries.length,
        presentCount: summaries.filter(s => s.status === 'present').length,
        partialCount: summaries.filter(s => s.status === 'partial').length,
        absentCount: summaries.filter(s => s.status === 'absent').length,
        averageAttendance: summaries.length > 0 ? 
          summaries.reduce((sum, s) => sum + s.attendancePercentage, 0) / summaries.length : 0,
        students: summaries,
        generatedAt: new Date().toISOString(),
      });
    }

    // Return raw check-in data
    return NextResponse.json(eventCheckIns, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching check-in data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch check-in data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/checkin
 * Record a check-in/check-out for a student
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const { studentId, period, timestamp }: CheckInRequest = await request.json();

    if (!studentId || !period || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, period, timestamp' },
        { status: 400 }
      );
    }

    const validPeriods: (keyof CheckInRecord)[] = ['morningIn', 'lunchOut', 'lunchIn', 'afternoonOut'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

    const checkInData = await getCheckInData();
    
    // Initialize event data if it doesn't exist
    if (!checkInData[eventId]) {
      checkInData[eventId] = {};
    }

    // Initialize student data if it doesn't exist
    if (!checkInData[eventId][studentId]) {
      checkInData[eventId][studentId] = {};
    }

    // Record the check-in/out
    checkInData[eventId][studentId][period] = timestamp;

    // Save the updated data
    await saveCheckInData(checkInData);

    // Calculate updated attendance summary for this student
    const attendanceSummary = calculateAttendanceSummary(
      studentId, 
      checkInData[eventId][studentId]
    );

    return NextResponse.json({
      success: true,
      message: `${period} recorded for student ${studentId}`,
      studentId,
      period,
      timestamp,
      attendanceSummary,
      eventCheckIns: checkInData[eventId][studentId],
    });
  } catch (error) {
    console.error('Error recording check-in:', error);
    return NextResponse.json(
      { error: 'Failed to record check-in' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[id]/checkin
 * Bulk update check-in data (useful for instructor corrections)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const updates = await request.json();

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Invalid update data format' },
        { status: 400 }
      );
    }

    const checkInData = await getCheckInData();
    
    // Initialize event data if it doesn't exist
    if (!checkInData[eventId]) {
      checkInData[eventId] = {};
    }

    // Apply updates
    let updatedCount = 0;
    for (const [studentId, studentUpdates] of Object.entries(updates)) {
      if (typeof studentUpdates === 'object' && studentUpdates !== null) {
        checkInData[eventId][studentId] = {
          ...checkInData[eventId][studentId],
          ...studentUpdates as CheckInRecord,
        };
        updatedCount++;
      }
    }

    // Save the updated data
    await saveCheckInData(checkInData);

    return NextResponse.json({
      success: true,
      message: `Updated check-in data for ${updatedCount} students`,
      updatedCount,
      eventId,
    });
  } catch (error) {
    console.error('Error bulk updating check-in data:', error);
    return NextResponse.json(
      { error: 'Failed to update check-in data' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/checkin
 * Clear check-in data for an event or specific student
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');

    const checkInData = await getCheckInData();

    if (studentId) {
      // Clear data for specific student
      if (checkInData[eventId] && checkInData[eventId][studentId]) {
        delete checkInData[eventId][studentId];
        await saveCheckInData(checkInData);
        
        return NextResponse.json({
          success: true,
          message: `Cleared check-in data for student ${studentId}`,
          studentId,
          eventId,
        });
      } else {
        return NextResponse.json(
          { error: 'Student check-in data not found' },
          { status: 404 }
        );
      }
    } else {
      // Clear all data for the event
      if (checkInData[eventId]) {
        delete checkInData[eventId];
        await saveCheckInData(checkInData);
        
        return NextResponse.json({
          success: true,
          message: `Cleared all check-in data for event ${eventId}`,
          eventId,
        });
      } else {
        return NextResponse.json(
          { error: 'Event check-in data not found' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Error clearing check-in data:', error);
    return NextResponse.json(
      { error: 'Failed to clear check-in data' },
      { status: 500 }
    );
  }
}