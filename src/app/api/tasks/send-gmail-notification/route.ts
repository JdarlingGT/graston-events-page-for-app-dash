import { NextResponse } from 'next/server';
import { getGmailClient } from '@/lib/google';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { to, subject, body } = await request.json();

    const gmail = getGmailClient();

    const messageParts = [
      `From: me`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      body,
    ];

    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return NextResponse.json({ success: true, messageId: response.data.id });
  } catch (error) {
    console.error('Error sending Gmail notification:', error);
    return NextResponse.json({ success: false, error: 'Failed to send Gmail notification' }, { status: 500 });
  }
}