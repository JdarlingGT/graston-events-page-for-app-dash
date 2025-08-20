import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const instructorsPath = path.join(jsonDirectory, 'instructors.json');
const eventsPath = path.join(jsonDirectory, 'events.json');

async function readJson(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

// Stable hash for pseudo-randomization
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Resolve current user identity from headers.
 * We support (in priority):
 *  - x-user-id
 *  - x-user-email
 *  - x-user-name
 */
function resolveIdentity(req: NextRequest) {
  const id = req.headers.get('x-user-id') || undefined;
  const email = req.headers.get('x-user-email') || undefined;
  const name = req.headers.get('x-user-name') || undefined;
  // role is resolved/enforced by middleware, but include for diagnostics
  const role = req.headers.get('x-user-role') || req.headers.get('x-user-role-resolved') || undefined;
  return { id, email, name, role };
}

/**
 * GET /api/instructors/me
 * Role-protected (see middleware). Returns the current instructor profile plus light analytics and upcoming events.
 */
export async function GET(req: NextRequest) {
  try {
    const { id, email, name, role } = resolveIdentity(req);

    // Load datasets
    const [instructors, events] = await Promise.all([
      readJson(instructorsPath),
      readJson(eventsPath),
    ]);

    // Try to locate instructor by id/email/name
    const me =
      (id ? instructors.find((i: any) => i.id === id) : undefined) ||
      (email ? instructors.find((i: any) => (i.email || '').toLowerCase() === email.toLowerCase()) : undefined) ||
      (name ? instructors.find((i: any) => (i.name || '').toLowerCase() === name.toLowerCase()) : undefined) ||
      instructors[0]; // fallback to first for dev

    if (!me) {
      return NextResponse.json(
        { error: 'Instructor profile not found for current identity' },
        { status: 404 },
      );
    }

    // Attach derived stats (safe defaults if missing)
    const totalEvents = Number(me?.performanceMetrics?.totalEventsInstructed || 0);
    const totalStudents = Number(me?.performanceMetrics?.totalStudentsTrained || 0);
    const avgRating = Number(me?.performanceMetrics?.averageStudentRating || 0);

    // Compute upcoming events assigned to instructor
    // The mock data commonly links by name; match both by name and instructor.id if present in events
    const meName = (me.name || '').toLowerCase();
    const upcomingEvents = (events || [])
      .filter((e: any) => {
        const assignedByName =
          e?.instructor && (e.instructor.name || e.instructor || '').toLowerCase() === meName;
        const assignedById = e?.instructorId && me?.id && e.instructorId === me.id;
        const isFuture =
          (e.date || e.startDate) && new Date(e.date || e.startDate).getTime() >= Date.now();
        return (assignedByName || assignedById) && isFuture;
      })
      .slice(0, 10)
      .map((e: any) => ({
        id: e.id,
        title: e.title || e.name,
        city: e.city,
        state: e.state,
        date: e.date || e.startDate,
        mode: e.mode,
        type: e.type,
        enrolled: e.enrolledStudents || 0,
        capacity: e.capacity || 0,
      }));

    // Lightweight utilization and coaching signals
    const seed = hash(me.id || me.name || me.email || 'instructor');
    const utilizationPercent = 60 + (seed % 35); // 60-95
    const coachingOpportunities = [
      'Improve pre-class communication cadence',
      'Share high-scoring lesson plan across peers',
      'Review latest feedback on pacing',
      'Shadow an advanced course for new techniques',
    ].filter((_, idx) => (seed + idx) % 2 === 0);

    const result = {
      roleResolved: role || 'unknown',
      profile: me,
      summary: {
        totalEvents,
        totalStudents,
        averageRating: avgRating,
        utilizationPercent,
      },
      upcomingEvents,
      coachingOpportunities,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('GET /api/instructors/me error:', err);
    return NextResponse.json(
      { error: 'Failed to resolve current instructor' },
      { status: 500 },
    );
  }
}