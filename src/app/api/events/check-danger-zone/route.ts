import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { DANGER_ZONE_CONFIG } from '@/lib/config';
import { differenceInDays, parseISO } from 'date-fns';

const eventsDirectory = path.join(process.cwd(), 'public', 'mock-data', 'events');

interface Event {
  id: string;
  name: string;
  enrolledStudents: number;
  instrumentsPurchased: number;
  mode: "In-Person" | "Virtual";
  date: string;
}

async function readAllEventFiles(): Promise<Event[]> {
  try {
    await fs.mkdir(eventsDirectory, { recursive: true });
    const files = await fs.readdir(eventsDirectory);
    const eventFiles = files.filter(file => file.endsWith('.json'));
    const allEvents: Event[] = [];
    for (const file of eventFiles) {
      const fileContents = await fs.readFile(path.join(eventsDirectory, file), 'utf8');
      allEvents.push(JSON.parse(fileContents));
    }
    return allEvents;
  } catch (error) {
    console.error('Failed to read event files:', error);
    return [];
  }
}

export async function POST() {
  try {
    const allEvents = await readAllEventFiles();
    const upcomingEvents = allEvents.filter(event => differenceInDays(parseISO(event.date), new Date()) >= 0);
    
    const atRiskEvents = [];

    for (const event of upcomingEvents) {
      const threshold = DANGER_ZONE_CONFIG.THRESHOLDS[event.mode] || 0;
      const totalSignups = (event.enrolledStudents || 0) + (event.instrumentsPurchased || 0);
      const isBelowThreshold = totalSignups < threshold;
      
      if (isBelowThreshold) {
        const daysAway = differenceInDays(parseISO(event.date), new Date());
        let urgency = "At Risk";
        if (daysAway < DANGER_ZONE_CONFIG.URGENCY_DAYS.URGENT) {
          urgency = "CRITICAL";
        } else if (daysAway <= DANGER_ZONE_CONFIG.URGENCY_DAYS.WARNING) {
          urgency = "Warning";
        }
        
        atRiskEvents.push({
          name: event.name,
          urgency: urgency,
          daysAway: daysAway,
          signups: totalSignups,
          threshold: threshold,
        });
      }
    }

    // Simulate sending notifications
    if (atRiskEvents.length > 0) {
      console.log("--- Proactive Alert Simulation ---");
      atRiskEvents.forEach(event => {
        console.log(`[ALERT] Event "${event.name}" is ${event.urgency}. ${event.signups}/${event.threshold} signups, ${event.daysAway} days away.`);
      });
      console.log("------------------------------------");
    }

    return NextResponse.json({
      success: true,
      checked: upcomingEvents.length,
      atRiskCount: atRiskEvents.length,
      atRiskEvents: atRiskEvents,
    });

  } catch (error) {
    console.error("Failed to run danger zone check:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}