import { NextResponse } from 'next/server';
import { sendGmailNotification } from '@/lib/google';

// In a real app, you'd fetch this from your database
const mockStudents = [
  { id: 'student-1', name: 'Alice Johnson', email: 'user@example.com', preCourseCompleted: true },
  { id: 'student-2', name: 'Bob Smith', email: 'user@example.com', preCourseCompleted: false },
  { id: 'student-3', name: 'Carol Davis', email: 'user@example.com', preCourseCompleted: false },
];

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    // In a real app, you'd fetch event details too
    const eventName = 'Advanced React Patterns Workshop'; 

    const studentsToRemind = mockStudents.filter(s => !s.preCourseCompleted);

    for (const student of studentsToRemind) {
      const task = {
        title: `Reminder: Complete Pre-Course Work for ${eventName}`,
        description: `Hi ${student.name},\n\nThis is a friendly reminder to complete your pre-course materials for the upcoming "${eventName}" event. Completing this work is essential for you to get the most out of the training.\n\nPlease log in to your portal to access the materials.\n\nWe look forward to seeing you soon!`,
        assignee: { name: student.name, email: student.email },
      };
      // Using the existing gmail function, adapted for this purpose
      await sendGmailNotification(task);
    }

    return NextResponse.json({
      success: true,
      sentCount: studentsToRemind.length,
      message: `Reminder emails sent to ${studentsToRemind.length} students.`,
    });
  } catch (error) {
    console.error('Failed to send reminders:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}