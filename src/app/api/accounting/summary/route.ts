import { NextApiRequest, NextApiResponse } from 'next';

// Sample data for demonstration purposes
const accountingData = {
  totalRevenue: 100000,
  totalExpenses: 50000,
  netProfit: 50000,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return the accounting summary
    res.status(200).json(accountingData);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}