import { OAuth2Client } from 'google-auth-library';
import { promises as fs } from 'fs';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

export function getOAuth2Client(): OAuth2Client {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("Google API credentials are not configured in environment variables.");
  }
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );
}

export async function storeToken(tokens: any) {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
}

export async function getStoredToken() {
  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf8');
    return JSON.parse(token);
  } catch (error) {
    return null;
  }
}

export async function createCalendarEvent(task: any) {
  const tokens = await getStoredToken();
  if (!tokens || !task.dueDate || !task.assignee) return;

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = (await import('googleapis')).google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: `Task: ${task.title}`,
    description: task.description || 'No description provided.',
    start: {
      dateTime: new Date(task.dueDate).toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    end: {
      dateTime: new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
      timeZone: 'America/Los_Angeles',
    },
    attendees: [{ email: task.assignee.email }], // Assuming assignee has an email
  };

  try {
    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    console.log('Calendar event created successfully.');
  } catch (error) {
    console.error('Failed to create calendar event:', error);
  }
}

export async function sendGmailNotification(task: any) {
    const tokens = await getStoredToken();
    if (!tokens || !task.assignee || !task.assignee.email) return;

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);

    const gmail = (await import('googleapis')).google.gmail({ version: 'v1', auth: oauth2Client });

    const subject = `New Task Assigned: ${task.title}`;
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
        `From: Me <me>`,
        `To: ${task.assignee.name} <${task.assignee.email}>`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        `A new task has been assigned to you:`,
        `<b>Title:</b> ${task.title}`,
        `<b>Description:</b> ${task.description || 'N/A'}`,
        `<b>Due Date:</b> ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}`,
    ];
    const message = messageParts.join('\n');

    const rawMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage,
            },
        });
        console.log('Gmail notification sent successfully.');
    } catch (error) {
        console.error('Failed to send Gmail notification:', error);
    }
}

export async function createGoogleTask(task: { title: string; description?: string; dueDate?: string }) {
  const tokens = await getStoredToken();
  if (!tokens) {
    console.log("No Google token found, skipping Google Task creation.");
    return;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const tasks = (await import('googleapis')).google.tasks({ version: 'v1', auth: oauth2Client });

  const taskResource = {
    title: task.title,
    notes: task.description,
    due: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
  };

  try {
    await tasks.tasks.insert({
      tasklist: '@default', // Use the default task list
      requestBody: taskResource,
    });
    console.log(`Google Task created: "${task.title}"`);
  } catch (error) {
    console.error('Failed to create Google Task:', error);
  }
}