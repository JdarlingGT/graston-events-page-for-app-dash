import { NextResponse } from 'next/server';
import { getStoredToken, getOAuth2Client } from '@/lib/google';

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  try {
    const { type, task, recipientEmails } = await request.json();

    // Compose email subject/body based on notification type
    let subject = "";
    let body = "";

    switch (type) {
      case "assigned":
        subject = `New Task Assigned: ${task.title}`;
        body = `You have been assigned a new task in project "${task.projectName}":\n\nTitle: ${task.title}\nDescription: ${task.description}\nDue: ${task.dueDate || "N/A"}\n\nPlease check the project dashboard for more details.`;
        break;
      case "completed":
        subject = `Task Completed: ${task.title}`;
        body = `The following task has been marked as completed in project "${task.projectName}":\n\nTitle: ${task.title}\nDescription: ${task.description}\n\nGreat job!`;
        break;
      case "past_due":
        subject = `Task Past Due: ${task.title}`;
        body = `The following task is past due in project "${task.projectName}":\n\nTitle: ${task.title}\nDescription: ${task.description}\nDue: ${task.dueDate || "N/A"}\n\nPlease take action as soon as possible.`;
        break;
      default:
        subject = `Project Notification: ${task.title}`;
        body = `Notification for task "${task.title}" in project "${task.projectName}".`;
    }

    // Send email via Gmail API
    const tokens = await getStoredToken();
    if (!tokens) {
      return new NextResponse('Google account not connected', { status: 401 });
    }
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials(tokens);
    const gmail = (await import('googleapis')).google.gmail({ version: 'v1', auth: oauth2Client });

    for (const email of recipientEmails) {
      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: Project Bot <me>`,
        `To: <${email}>`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        body,
      ];
      const message = messageParts.join('\n');
      const rawMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage },
      });
    }

    return NextResponse.json({ success: true, sent: recipientEmails.length });
  } catch (error) {
    console.error("Failed to send project notification:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}