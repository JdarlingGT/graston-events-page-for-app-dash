import { NextApiRequest, NextApiResponse } from 'next';

// Sample data for demonstration purposes
const eventExpenses = {
  eventId: '123',
  expenses: [
    { id: '1', description: 'Venue Rental', amount: 1000 },
    { id: '2', description: 'Catering', amount: 500 },
    { id: '3', description: 'Marketing', amount: 300 },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // Return the expenses for the specified event
    if (id === eventExpenses.eventId) {
      res.status(200).json(eventExpenses.expenses);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}