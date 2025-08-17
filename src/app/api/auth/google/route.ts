import { NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google';

export async function GET() {
  const oauth2Client = getOAuth2Client();

  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/drive.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Important to get a refresh token
  });

  return NextResponse.redirect(url);
}