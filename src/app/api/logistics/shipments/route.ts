import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

// Data store
const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const shipmentsPath = path.join(jsonDirectory, 'shipments.json');

// Types
type ShipmentStatus = 'pending' | 'packed' | 'shipped' | 'delivered' | 'delayed' | 'canceled';

interface ShipmentItem {
  sku: string;
  name: string;
  qty: number;
}

interface Shipment {
  id: string;
  eventId?: string; // optional linkage to event
  eventName?: string;
  title: string; // human-readable
  status: ShipmentStatus;
  priority: 'high' | 'medium' | 'low';
  assignee?: string; // user/email
  items: ShipmentItem[];
  notes?: string;
  address?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  slaDueAt?: string; // ISO
  createdAt: string; // ISO
  updatedAt: string; // ISO
  history?: Array<{
    at: string; // ISO
    from: ShipmentStatus;
    to: ShipmentStatus;
    by?: string;
    note?: string;
  }>;
}

// Helpers
async function readShipments(): Promise<Shipment[]> {
  try {
    const content = await fs.readFile(shipmentsPath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch {
    // seed with a small set if file missing
    return [
      {
        id: 'ship_' + Date.now(),
        title: 'Starter Kit - Indianapolis',
        eventId: 'evt_101',
        eventName: 'Essential Training - Indianapolis',
        status: 'pending',
        priority: 'high',
        assignee: 'logistics@org.com',
        items: [
          { sku: 'KIT-START', name: 'Starter Kit', qty: 10 },
          { sku: 'PPE-GLOVES', name: 'PPE Gloves Box', qty: 5 },
        ],
        notes: 'Ship by next Friday',
        address: {
          name: 'JW Marriott Indianapolis',
          line1: '10 S West St',
          city: 'Indianapolis',
          state: 'IN',
          postalCode: '46204',
          country: 'US',
        },
        slaDueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [],
      },
    ];
  }
}

async function writeShipments(list: Shipment[]): Promise<void> {
  await fs.mkdir(jsonDirectory, { recursive: true });
  await fs.writeFile(shipmentsPath, JSON.stringify(list, null, 2), 'utf8');
}

function paginate<T>(arr: T[], page: number, limit: number) {
  const total = arr.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: arr.slice(start, end),
    total,
    page,
    limit,
    hasMore: end < total,
  };
}

function validStatus(s: any): s is ShipmentStatus {
  return ['pending', 'packed', 'shipped', 'delivered', 'delayed', 'canceled'].includes(String(s));
}

// GET /api/logistics/shipments
// Supports filtering: status, assignee, eventId, priority; sorting by updatedAt or slaDueAt; pagination
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.getAll('status');
    const assignee = url.searchParams.get('assignee') || undefined;
    const eventId = url.searchParams.get('eventId') || undefined;
    const priority = url.searchParams.getAll('priority');
    const sortBy = url.searchParams.get('sortBy') || 'updatedAt'; // updatedAt|slaDueAt|priority
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc').toLowerCase(); // asc|desc
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);

    let shipments = await readShipments();

    // Filters
    if (status.length) {
      const set = new Set(status);
      shipments = shipments.filter((s) => set.has(s.status));
    }
    if (assignee) {
      shipments = shipments.filter((s) => (s.assignee || '').toLowerCase() === assignee.toLowerCase());
    }
    if (eventId) {
      shipments = shipments.filter((s) => (s.eventId || '') === eventId);
    }
    if (priority.length) {
      const pset = new Set(priority);
      shipments = shipments.filter((s) => pset.has(s.priority));
    }

    // Sorting
    shipments.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      switch (sortBy) {
        case 'slaDueAt':
          av = a.slaDueAt ? new Date(a.slaDueAt).getTime() : 0;
          bv = b.slaDueAt ? new Date(b.slaDueAt).getTime() : 0;
          break;
        case 'priority': {
          const rank = { high: 3, medium: 2, low: 1 } as const;
          av = rank[a.priority];
          bv = rank[b.priority];
          break;
        }
        case 'updatedAt':
        default:
          av = new Date(a.updatedAt).getTime();
          bv = new Date(b.updatedAt).getTime();
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -1 * cmp;
    });

    const { data, total, hasMore } = paginate(shipments, page, limit);

    return NextResponse.json(
      {
        shipments: data,
        total,
        page,
        limit,
        hasMore,
        summary: {
          pending: shipments.filter((s) => s.status === 'pending').length,
          packed: shipments.filter((s) => s.status === 'packed').length,
          shipped: shipments.filter((s) => s.status === 'shipped').length,
          delivered: shipments.filter((s) => s.status === 'delivered').length,
          delayed: shipments.filter((s) => s.status === 'delayed').length,
          canceled: shipments.filter((s) => s.status === 'canceled').length,
        },
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (err) {
    console.error('GET /api/logistics/shipments error:', err);
    return NextResponse.json({ error: 'Failed to fetch shipments' }, { status: 500 });
  }
}

// POST /api/logistics/shipments
// Create a new shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Minimal validation
    if (!body?.title || !Array.isArray(body?.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'title and items[] are required' },
        { status: 400 },
      );
    }
    if (body.status && !validStatus(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const id = body.id || `ship_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newShipment: Shipment = {
      id,
      title: String(body.title),
      eventId: body.eventId || undefined,
      eventName: body.eventName || undefined,
      status: (body.status as ShipmentStatus) || 'pending',
      priority: body.priority || 'medium',
      assignee: body.assignee || undefined,
      items: body.items.map((it: any) => ({
        sku: String(it.sku || ''),
        name: String(it.name || ''),
        qty: Number(it.qty || 0),
      })),
      notes: body.notes || undefined,
      address: body.address
        ? {
            name: String(body.address.name || ''),
            line1: String(body.address.line1 || ''),
            line2: body.address.line2 ? String(body.address.line2) : undefined,
            city: String(body.address.city || ''),
            state: String(body.address.state || ''),
            postalCode: String(body.address.postalCode || ''),
            country: String(body.address.country || ''),
          }
        : undefined,
      slaDueAt: body.slaDueAt || undefined,
      createdAt: now,
      updatedAt: now,
      history: [],
    };

    const list = await readShipments();
    list.unshift(newShipment);
    await writeShipments(list);

    return NextResponse.json(newShipment, { status: 201 });
  } catch (err) {
    console.error('POST /api/logistics/shipments error:', err);
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}

// PATCH /api/logistics/shipments
// Bulk update operations: change status, assign user, add note
// Body: { ids: string[], op: 'status'|'assign'|'note', value: any, by?: string }
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    const op: string = String(body?.op || '');
    const value = body?.value;
    const by = body?.by || 'system';

    if (!ids.length || !op) {
      return NextResponse.json({ error: 'ids[] and op are required' }, { status: 400 });
    }

    const list = await readShipments();
    const idset = new Set(ids);
    let updated = 0;
    const now = new Date().toISOString();

    for (const s of list) {
      if (!idset.has(s.id)) {
continue;
}

      switch (op) {
        case 'status': {
          if (!validStatus(value)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
          }
          const from = s.status;
          s.status = value;
          s.updatedAt = now;
          s.history = s.history || [];
          s.history.push({ at: now, from, to: s.status, by, note: body?.note });
          updated++;
          break;
        }
        case 'assign': {
          s.assignee = typeof value === 'string' ? value : s.assignee;
          s.updatedAt = now;
          updated++;
          break;
        }
        case 'note': {
          s.notes = [s.notes, typeof value === 'string' ? value : ''].filter(Boolean).join('\n');
          s.updatedAt = now;
          updated++;
          break;
        }
        default:
          return NextResponse.json({ error: 'Unsupported op' }, { status: 400 });
      }
    }

    await writeShipments(list);

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error('PATCH /api/logistics/shipments error:', err);
    return NextResponse.json({ error: 'Failed to update shipments' }, { status: 500 });
  }
}