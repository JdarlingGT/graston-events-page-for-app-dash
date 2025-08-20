import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const inventoryPath = path.join(jsonDirectory, 'inventory.json');
const eventsPath = path.join(jsonDirectory, 'events.json');

type CourseType = 'Essential' | 'Advanced' | 'Upper Quadrant';

interface InventoryItem {
  sku: string;
  name: string;
  unit?: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;      // when onHand - reserved <= reorderPoint => alert
  leadTimeDays: number;      // for projected shortfalls windowing
  notes?: string;
  updatedAt: string;         // ISO
}

interface ProjectedUsage {
  sku: string;
  name: string;
  required: number;
  withinDays: number;
}

interface InventorySummary {
  totalSkus: number;
  totalOnHand: number;
  totalReserved: number;
  belowReorder: number;
  lowStock: number;
  projectedShortfalls: number;
}

interface OverviewResponse {
  items: InventoryItem[];
  summary: InventorySummary;
  projectedUsage: ProjectedUsage[];
  shortfalls: Array<{
    sku: string;
    name: string;
    onHand: number;
    reserved: number;
    netAvailable: number;
    projectedRequired: number;
    shortage: number; // projectedRequired - netAvailable (if > 0)
    windowDays: number;
  }>;
  parameters: {
    windowDays: number;
  };
  timestamp: string;
}

// Seed inventory if file missing
async function ensureInventory(): Promise<InventoryItem[]> {
  try {
    const content = await fs.readFile(inventoryPath, 'utf8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
return parsed;
}
  } catch {
    // no-op, will seed below
  }

  const seed: InventoryItem[] = [
    {
      sku: 'KIT-START',
      name: 'Starter Kit',
      unit: 'kit',
      onHand: 75,
      reserved: 10,
      reorderPoint: 20,
      leadTimeDays: 7,
      updatedAt: new Date().toISOString(),
    },
    {
      sku: 'PPE-GLOVES',
      name: 'PPE Gloves Box',
      unit: 'box',
      onHand: 200,
      reserved: 30,
      reorderPoint: 50,
      leadTimeDays: 5,
      updatedAt: new Date().toISOString(),
    },
    {
      sku: 'BOOK-M1',
      name: 'Course Manual M1',
      unit: 'ea',
      onHand: 120,
      reserved: 12,
      reorderPoint: 30,
      leadTimeDays: 10,
      updatedAt: new Date().toISOString(),
    },
    {
      sku: 'LANYARD',
      name: 'Lanyard',
      unit: 'ea',
      onHand: 400,
      reserved: 80,
      reorderPoint: 100,
      leadTimeDays: 14,
      updatedAt: new Date().toISOString(),
    },
  ];

  await fs.mkdir(jsonDirectory, { recursive: true });
  await fs.writeFile(inventoryPath, JSON.stringify(seed, null, 2), 'utf8');
  return seed;
}

async function readInventory(): Promise<InventoryItem[]> {
  try {
    const content = await fs.readFile(inventoryPath, 'utf8');
    return JSON.parse(content);
  } catch {
    return ensureInventory();
  }
}

async function writeInventory(items: InventoryItem[]) {
  await fs.mkdir(jsonDirectory, { recursive: true });
  await fs.writeFile(inventoryPath, JSON.stringify(items, null, 2), 'utf8');
}

async function readEvents(): Promise<any[]> {
  try {
    const content = await fs.readFile(eventsPath, 'utf8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Simple consumption matrix by course type
 * You can adjust as needed or make this configurable later via admin UI.
 */
const CONSUMPTION_MATRIX: Record<CourseType, Array<{ sku: string; qtyPerEvent: number }>> = {
  Essential: [
    { sku: 'KIT-START', qtyPerEvent: 10 },
    { sku: 'PPE-GLOVES', qtyPerEvent: 5 },
    { sku: 'BOOK-M1', qtyPerEvent: 10 },
    { sku: 'LANYARD', qtyPerEvent: 15 },
  ],
  Advanced: [
    { sku: 'KIT-START', qtyPerEvent: 8 },
    { sku: 'PPE-GLOVES', qtyPerEvent: 4 },
    { sku: 'BOOK-M1', qtyPerEvent: 8 },
    { sku: 'LANYARD', qtyPerEvent: 12 },
  ],
  'Upper Quadrant': [
    { sku: 'KIT-START', qtyPerEvent: 6 },
    { sku: 'PPE-GLOVES', qtyPerEvent: 4 },
    { sku: 'BOOK-M1', qtyPerEvent: 6 },
    { sku: 'LANYARD', qtyPerEvent: 10 },
  ],
};

function withinWindow(dateStr?: string, windowDays: number = 30): boolean {
  if (!dateStr) {
return false;
}
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  return d >= now && d <= now + windowMs;
}

function buildProjectedUsage(events: any[], windowDays: number): Record<string, number> {
  const usage: Record<string, number> = {};
  for (const e of events) {
    const type: CourseType = e?.type;
    const when = e?.date || e?.startDate;
    if (!type || !withinWindow(when, windowDays)) {
continue;
}

    const rows = CONSUMPTION_MATRIX[type] || [];
    for (const row of rows) {
      usage[row.sku] = (usage[row.sku] || 0) + row.qtyPerEvent;
    }
  }
  return usage;
}

/**
 * GET /api/inventory/overview
 * Query params:
 *  - windowDays (default 30) -> horizon for projected usage
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const windowDays = Math.max(1, Math.min(120, Number(url.searchParams.get('windowDays') || 30)));

    const [items, events] = await Promise.all([readInventory(), readEvents()]);
    const usageMap = buildProjectedUsage(events, windowDays);

    const projectedUsage: ProjectedUsage[] = items.map((it) => ({
      sku: it.sku,
      name: it.name,
      required: usageMap[it.sku] || 0,
      withinDays: windowDays,
    }));

    const shortfalls: OverviewResponse['shortfalls'] = [];
    let belowReorder = 0;
    let lowStock = 0;

    for (const it of items) {
      const netAvailable = Math.max(0, (it.onHand || 0) - (it.reserved || 0));
      const projectedRequired = usageMap[it.sku] || 0;
      const shortage = Math.max(0, projectedRequired - netAvailable);

      if (netAvailable <= it.reorderPoint) {
belowReorder++;
}
      // define "low stock" as <= 1.25 * reorder point (heuristic)
      if (netAvailable <= Math.ceil(it.reorderPoint * 1.25)) {
lowStock++;
}

      if (shortage > 0) {
        shortfalls.push({
          sku: it.sku,
          name: it.name,
          onHand: it.onHand,
          reserved: it.reserved,
          netAvailable,
          projectedRequired,
          shortage,
          windowDays,
        });
      }
    }

    const summary: InventorySummary = {
      totalSkus: items.length,
      totalOnHand: items.reduce((s, v) => s + (v.onHand || 0), 0),
      totalReserved: items.reduce((s, v) => s + (v.reserved || 0), 0),
      belowReorder,
      lowStock,
      projectedShortfalls: shortfalls.length,
    };

    const response: OverviewResponse = {
      items,
      summary,
      projectedUsage,
      shortfalls,
      parameters: { windowDays },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=180',
      },
    });
  } catch (err) {
    console.error('GET /api/inventory/overview error:', err);
    return NextResponse.json({ error: 'Failed to compute inventory overview' }, { status: 500 });
  }
}

/**
 * PATCH /api/inventory/overview
 * Bulk adjustments to inventory quantities.
 * Body shape: { ops: Array<{ sku: string, action: 'adjust'|'reserve'|'release'|'receive', qty: number, notes?: string }> }
 *  - adjust: onHand += qty
 *  - reserve: reserved += qty
 *  - release: reserved -= qty (not below 0)
 *  - receive: onHand += qty (supply incoming)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const ops = Array.isArray(body?.ops) ? body.ops : [];

    if (!ops.length) {
      return NextResponse.json({ error: 'ops[] is required' }, { status: 400 });
    }

    const items = await readInventory();
    const bySku: Record<string, InventoryItem> = Object.fromEntries(items.map((i) => [i.sku, i]));
    let updated = 0;

    for (const op of ops) {
      const sku = String(op?.sku || '');
      const action = String(op?.action || '');
      const qty = Number(op?.qty || 0);
      if (!sku || !action || !Number.isFinite(qty)) {
continue;
}

      const it = bySku[sku];
      if (!it) {
continue;
}

      switch (action) {
        case 'adjust':
          it.onHand = Math.max(0, it.onHand + qty);
          break;
        case 'reserve':
          it.reserved = Math.max(0, it.reserved + qty);
          break;
        case 'release':
          it.reserved = Math.max(0, it.reserved - qty);
          break;
        case 'receive':
          it.onHand = Math.max(0, it.onHand + qty);
          break;
        default:
          continue;
      }

      if (op?.notes) {
        it.notes = [it.notes, String(op.notes)].filter(Boolean).join('\n');
      }
      it.updatedAt = new Date().toISOString();
      updated++;
    }

    const next = Object.values(bySku);
    await writeInventory(next);

    return NextResponse.json({ success: true, updated }, { status: 200 });
  } catch (err) {
    console.error('PATCH /api/inventory/overview error:', err);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}