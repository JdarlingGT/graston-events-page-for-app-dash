import { NextResponse } from 'next/server';
import { mockProviders } from '@/lib/mock-data';
import path from 'path';
import { promises as fs } from 'fs';

const eventsDirectory = path.join(process.cwd(), 'public', 'mock-data', 'events');

async function readEventFile(id: string) {
  try {
    const filePath = path.join(eventsDirectory, `${id}.json`);
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

export async function POST(request: Request) {
  const { providerId, eventId } = await request.json() as { providerId: string, eventId: string };

  if (!providerId || !eventId) {
    return new NextResponse('Provider ID and Event ID are required', { status: 400 });
  }

  const provider = mockProviders.find(p => p.id === providerId);
  const event = await readEventFile(eventId);

  if (!provider || !event) {
    return new NextResponse('Provider or Event not found', { status: 404 });
  }

  // Simulate AI generation delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const lastCourse = provider.trainingHistory.length > 0 
    ? provider.trainingHistory[provider.trainingHistory.length - 1].eventName 
    : null;

  // AI Email Generation Logic
  const subject = `An Invitation to our ${event.type} Training in ${event.city}`;
  
  let body = `Hi ${provider.name},\n\n`;

  if (lastCourse) {
    body += `I hope you're doing well. I saw that you previously attended our "${lastCourse}" course and wanted to personally reach out about an upcoming opportunity.\n\n`;
  } else {
    body += 'I hope this email finds you well. I\'m reaching out because we have an exciting training opportunity in your area.\n\n';
  }

  body += `We're hosting our "${event.name}" event in ${event.city} on ${new Date(event.date).toLocaleDateString()}. As a ${provider.providerType}, we believe this ${event.type} course would be a great next step to enhance your skills.\n\n`;
  body += 'You can find more details and register here: [Link to Event Page]\n\n';
  body += 'Let me know if you have any questions.\n\nBest regards,\n\nThe Sales Team';

  return NextResponse.json({ subject, body });
}