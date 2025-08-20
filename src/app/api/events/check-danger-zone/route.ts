import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'events.json');

type Mode = 'In-Person' | 'Virtual' | 'Hybrid';
type Status = 'upcoming' | 'cancelled' | 'completed' | 'ongoing';

interface Event {
  id: string;
  name: string;
  title?: string;
  city: string;
  state: string;
  instructor?: string;
  enrolledStudents: number;
  instrumentsPurchased?: number;
  capacity: number;
  minViableEnrollment: number;
  type: 'Essential' | 'Advanced' | 'Upper Quadrant';
  mode: Mode;
  status: Status;
  featuredImage?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

interface DangerZoneAlert {
  id: string;
  eventId: string;
  eventName: string;
  alertType: 'at-risk' | 'almost-full' | 'low-enrollment' | 'approaching-date';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendations: string[];
  daysUntilEvent: number;
  enrollmentData: {
    current: number;
    capacity: number;
    minViable: number;
    percentage: number;
  };
  location: string;
  instructor: string;
  deepLink: string;
  createdAt: string;
}

/**
 * Load all events from mock-data
 */
async function getEvents(): Promise<Event[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to read events data:', error);
    return [];
  }
}

/**
 * Calculate days until event
 */
function getDaysUntilEvent(eventDate: string): number {
  const today = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Analyze events and generate danger zone alerts
 */
function analyzeDangerZone(events: Event[]): DangerZoneAlert[] {
  const alerts: DangerZoneAlert[] = [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  for (const event of events) {
    // Skip cancelled or completed events
    if (event.status === 'cancelled' || event.status === 'completed') {
continue;
}

    const eventDate = event.date || event.startDate;
    if (!eventDate) {
continue;
}

    const daysUntil = getDaysUntilEvent(eventDate);
    const enrolled = event.enrolledStudents || 0;
    const capacity = event.capacity || 1;
    const minViable = event.minViableEnrollment || 0;
    const percentage = (enrolled / capacity) * 100;
    const location = `${event.city}, ${event.state}`;

    const enrollmentData = {
      current: enrolled,
      capacity,
      minViable,
      percentage: Math.round(percentage * 100) / 100,
    };

    // Critical: Event is at risk (below minimum viable enrollment) and approaching
    if (enrolled < minViable && daysUntil <= 14) {
      alerts.push({
        id: `${event.id}-at-risk-${Date.now()}`,
        eventId: event.id,
        eventName: event.title || event.name,
        alertType: 'at-risk',
        severity: daysUntil <= 7 ? 'critical' : 'high',
        message: `Event "${event.title || event.name}" is at risk with only ${enrolled}/${minViable} minimum viable enrollment and ${daysUntil} days remaining.`,
        recommendations: [
          'Launch targeted marketing campaign in local area',
          'Contact previous attendees for referrals',
          'Consider offering early bird pricing extension',
          'Evaluate event cancellation if enrollment doesn\'t improve',
          'Notify instructor of potential cancellation',
        ],
        daysUntilEvent: daysUntil,
        enrollmentData,
        location,
        instructor: event.instructor || 'Unassigned',
        deepLink: `${baseUrl}/dashboard/events/${event.id}`,
        createdAt: new Date().toISOString(),
      });
    }

    // High: Event is almost full and may need waitlist management
    if (percentage >= 90 && daysUntil > 0) {
      alerts.push({
        id: `${event.id}-almost-full-${Date.now()}`,
        eventId: event.id,
        eventName: event.title || event.name,
        alertType: 'almost-full',
        severity: percentage >= 95 ? 'high' : 'medium',
        message: `Event "${event.title || event.name}" is ${Math.round(percentage)}% full (${enrolled}/${capacity}) with ${daysUntil} days remaining.`,
        recommendations: [
          'Set up waitlist for additional registrations',
          'Prepare overflow venue or virtual option',
          'Send "limited spots" marketing message',
          'Confirm venue capacity and logistics',
          'Notify instructor of high enrollment',
        ],
        daysUntilEvent: daysUntil,
        enrollmentData,
        location,
        instructor: event.instructor || 'Unassigned',
        deepLink: `${baseUrl}/dashboard/events/${event.id}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Medium: Event approaching with low enrollment (but above minimum viable)
    if (enrolled >= minViable && enrolled < (capacity * 0.6) && daysUntil <= 21 && daysUntil > 7) {
      alerts.push({
        id: `${event.id}-low-enrollment-${Date.now()}`,
        eventId: event.id,
        eventName: event.title || event.name,
        alertType: 'low-enrollment',
        severity: 'medium',
        message: `Event "${event.title || event.name}" has moderate enrollment (${enrolled}/${capacity}) with ${daysUntil} days remaining.`,
        recommendations: [
          'Boost social media promotion',
          'Send reminder emails to prospects',
          'Partner with local organizations',
          'Consider limited-time discount',
          'Reach out to corporate clients',
        ],
        daysUntilEvent: daysUntil,
        enrollmentData,
        location,
        instructor: event.instructor || 'Unassigned',
        deepLink: `${baseUrl}/dashboard/events/${event.id}`,
        createdAt: new Date().toISOString(),
      });
    }

    // Low: Event approaching in 7 days (general preparation reminder)
    if (daysUntil === 7) {
      alerts.push({
        id: `${event.id}-approaching-${Date.now()}`,
        eventId: event.id,
        eventName: event.title || event.name,
        alertType: 'approaching-date',
        severity: 'low',
        message: `Event "${event.title || event.name}" is in 7 days. Final preparations needed.`,
        recommendations: [
          'Send final reminder emails to attendees',
          'Confirm venue setup and logistics',
          'Prepare materials and equipment',
          'Brief instructor on final attendee count',
          'Set up check-in process',
        ],
        daysUntilEvent: daysUntil,
        enrollmentData,
        location,
        instructor: event.instructor || 'Unassigned',
        deepLink: `${baseUrl}/dashboard/events/${event.id}`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return alerts;
}

/**
 * Send alerts to Slack
 */
async function sendSlackAlerts(alerts: DangerZoneAlert[]): Promise<void> {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!slackWebhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notifications');
    return;
  }

  // Group alerts by severity for better organization
  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.severity]) {
acc[alert.severity] = [];
}
    acc[alert.severity].push(alert);
    return acc;
  }, {} as Record<string, DangerZoneAlert[]>);

  const severityOrder = ['critical', 'high', 'medium', 'low'];
  const severityEmojis = {
    critical: '🚨',
    high: '⚠️',
    medium: '📊',
    low: 'ℹ️',
  };

  const severityColors = {
    critical: '#FF0000',
    high: '#FF8C00',
    medium: '#FFD700',
    low: '#36A64F',
  };

  for (const severity of severityOrder) {
    const severityAlerts = groupedAlerts[severity];
    if (!severityAlerts?.length) {
continue;
}

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `${severityEmojis[severity as keyof typeof severityEmojis]} ${severity.toUpperCase()} Event Alerts (${severityAlerts.length})`,
        },
      },
      {
        type: 'divider',
      },
    ];

    for (const alert of severityAlerts) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${alert.eventName}*\n${alert.message}`,
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Event',
          },
          url: alert.deepLink,
          action_id: `view_event_${alert.eventId}`,
        },
      } as any);

      blocks.push({
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Location:*\n${alert.location}`,
          },
          {
            type: 'mrkdwn',
            text: `*Instructor:*\n${alert.instructor}`,
          },
          {
            type: 'mrkdwn',
            text: `*Enrollment:*\n${alert.enrollmentData.current}/${alert.enrollmentData.capacity} (${alert.enrollmentData.percentage}%)`,
          },
          {
            type: 'mrkdwn',
            text: `*Days Until:*\n${alert.daysUntilEvent} days`,
          },
        ],
      } as any);

      if (alert.recommendations.length > 0) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Recommended Actions:*\n${alert.recommendations.map(rec => `• ${rec}`).join('\n')}`,
          },
        });
      }

      blocks.push({
        type: 'divider',
      });
    }

    const payload = {
      username: 'Event Coordinator Bot',
      icon_emoji: ':calendar:',
      attachments: [
        {
          color: severityColors[severity as keyof typeof severityColors],
          blocks,
        },
      ],
    };

    try {
      const response = await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Failed to send ${severity} alerts to Slack:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error sending ${severity} alerts to Slack:`, error);
    }
  }
}

/**
 * POST /api/events/check-danger-zone
 * Analyze all events for danger zone conditions and send Slack alerts
 * This endpoint is designed to be called by a scheduled job (cron)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify request is from authorized source (basic security)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await getEvents();
    const alerts = analyzeDangerZone(events);

    // Send alerts to Slack if any exist
    if (alerts.length > 0) {
      await sendSlackAlerts(alerts);
    }

    const summary = {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length,
      alertsGenerated: alerts.length,
      alertsBySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      alertsByType: alerts.reduce((acc, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      summary,
      alerts: alerts.map(alert => ({
        id: alert.id,
        eventId: alert.eventId,
        eventName: alert.eventName,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        daysUntilEvent: alert.daysUntilEvent,
        enrollmentData: alert.enrollmentData,
      })),
    });
  } catch (error) {
    console.error('Error in danger zone check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/events/check-danger-zone
 * Return current danger zone analysis without sending alerts (for dashboard)
 */
export async function GET() {
  try {
    const events = await getEvents();
    const alerts = analyzeDangerZone(events);

    const summary = {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length,
      alertsGenerated: alerts.length,
      alertsBySeverity: alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      alertsByType: alerts.reduce((acc, alert) => {
        acc[alert.alertType] = (acc[alert.alertType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      summary,
      alerts: alerts.map(alert => ({
        id: alert.id,
        eventId: alert.eventId,
        eventName: alert.eventName,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        recommendations: alert.recommendations,
        daysUntilEvent: alert.daysUntilEvent,
        enrollmentData: alert.enrollmentData,
        location: alert.location,
        instructor: alert.instructor,
        deepLink: alert.deepLink,
        createdAt: alert.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error in danger zone analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}