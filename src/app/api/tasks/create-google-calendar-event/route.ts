import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getOAuth2Client } from '@/lib/google';

export async function POST(request: Request) {
  try {
    const { title, dueDate, description } = await request.json();

    // Get the authenticated Google client
    const oauth2Client = getOAuth2Client();

    // Create a new calendar instance
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Create a new calendar event
    const event = {
      summary: title,
      description: description || '',
      start: {
        date: dueDate,
      },
      end: {
        date: dueDate,
      },
    };

    // Insert the event into the user's calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({ success: true, eventId: response.data.id });
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return NextResponse.json({ success: false, error: 'Failed to create Google Calendar event' }, { status: 500 });
  }
}