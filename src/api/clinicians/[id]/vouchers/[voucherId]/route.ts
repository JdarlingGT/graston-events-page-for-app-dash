import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

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

// PATCH - Revoke a voucher
export async function PATCH(request: Request, { params }: { params: { id: string; voucherId: string } }) {
  let allVouchers = await getVouchers();
  const voucherIndex = allVouchers.findIndex((v: any) => v.voucherId === params.voucherId && v.clinicianId === params.id);

  if (voucherIndex === -1) {
    return new NextResponse('Voucher not found', { status: 404 });
  }

  allVouchers[voucherIndex].status = 'Revoked';
  await saveVouchers(allVouchers);

  return NextResponse.json(allVouchers[voucherIndex]);
}