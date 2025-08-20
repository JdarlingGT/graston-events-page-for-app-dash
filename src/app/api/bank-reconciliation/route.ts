import { NextApiRequest, NextApiResponse } from 'next';

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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Perform reconciliation
    const reconciliationResult = bankStatements.map(statement => {
      const matchingEntry = ledgerEntries.find(entry => 
        entry.date === statement.date && 
        entry.description === statement.description && 
        entry.amount === statement.amount,
      );
      return {
        ...statement,
        reconciled: !!matchingEntry,
      };
    });

    res.status(200).json(reconciliationResult);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}