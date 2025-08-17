import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { z } from 'zod';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');
const filePath = path.join(jsonDirectory, 'vouchers.json');

async function getVouchers() {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

async function saveVouchers(vouchers: any) {
  await fs.writeFile(filePath, JSON.stringify(vouchers, null, 2), 'utf8');
}

// GET - List vouchers for a clinician
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const allVouchers = await getVouchers();
  const clinicianVouchers = allVouchers.filter((v: any) => v.clinicianId === params.id);
  return NextResponse.json(clinicianVouchers);
}

// POST - Issue a new voucher
const issueVoucherSchema = z.object({
  value: z.number(),
  type: z.enum(['fixed', 'percentage']),
  expirationDate: z.string().datetime(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = issueVoucherSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const allVouchers = await getVouchers();
    const newVoucher = {
      voucherId: `vch_${Date.now()}`,
      clinicianId: params.id,
      code: `SAVE${validation.data.value}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      ...validation.data,
      status: 'Active',
    };

    allVouchers.push(newVoucher);
    await saveVouchers(allVouchers);

    return NextResponse.json(newVoucher, { status: 201 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}