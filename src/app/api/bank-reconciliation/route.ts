import { NextRequest, NextResponse } from 'next/server';

// Sample data for demonstration purposes
const bankStatements = [
  { id: '1', date: '2025-08-01', description: 'Deposit', amount: 1000 },
  { id: '2', date: '2025-08-05', description: 'Withdrawal', amount: -200 },
  { id: '3', date: '2025-08-10', description: 'Deposit', amount: 500 },
];

const ledgerEntries = [
  { id: '1', date: '2025-08-01', description: 'Deposit', amount: 1000 },
  { id: '2', date: '2025-08-05', description: 'Withdrawal', amount: -200 },
  { id: '3', date: '2025-08-10', description: 'Deposit', amount: 500 },
];

export async function GET(request: NextRequest) {
  // Perform reconciliation
  const reconciliationResult = bankStatements.map(statement => {
    const matchingEntry = ledgerEntries.find(entry => 
      entry.date === statement.date && 
      entry.description === statement.description && 
      entry.amount === statement.amount
    );
    return {
      ...statement,
      reconciled: !!matchingEntry,
    };
  });

  return NextResponse.json(reconciliationResult);
}