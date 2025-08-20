import { NextRequest, NextResponse } from 'next/server';

// Sample data for demonstration purposes
const accountingData = {
  totalRevenue: 100000,
  totalExpenses: 50000,
  netProfit: 50000,
};

export async function GET(request: NextRequest) {
  // Return the accounting summary
  return NextResponse.json(accountingData);
}