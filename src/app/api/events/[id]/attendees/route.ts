import { NextRequest, NextResponse } from 'next/server';

// Mock data for attendees
const attendees = [
  { id: 'att-1', eventId: '25995731', name: 'Alice Johnson', email: 'alice@example.com', registrationDate: '2024-05-01', kitPurchased: true },
  { id: 'att-2', eventId: '25995731', name: 'Bob Williams', email: 'bob@example.com', registrationDate: '2024-05-03', kitPurchased: false },
  { id: 'att-3', eventId: '25995731', name: 'Charlie Brown', email: 'charlie@example.com', registrationDate: '2024-05-05', kitPurchased: true },
  { id: 'att-4', eventId: '26012317', name: 'Diana Prince', email: 'diana@example.com', registrationDate: '2024-06-10', kitPurchased: true },
  { id: 'att-5', eventId: '26012317', name: 'Ethan Hunt', email: 'ethan@example.com', registrationDate: '2024-06-12', kitPurchased: true },
  { id: 'att-6', eventId: '26017859', name: 'Fiona Glenanne', email: 'fiona@example.com', registrationDate: '2024-07-20', kitPurchased: false },
  { id: 'att-7', eventId: '26017859', name: 'George Costanza', email: 'george@example.com', registrationDate: '2024-07-22', kitPurchased: true },
  { id: 'att-8', eventId: '26021561', name: 'Hannah Montana', email: 'hannah@example.com', registrationDate: '2024-08-01', kitPurchased: true },
  { id: 'att-9', eventId: '26021561', name: 'Ian Somerhalder', email: 'ian@example.com', registrationDate: '2024-08-03', kitPurchased: false },
  { id: 'att-10', eventId: '26022807', name: 'Jessica Alba', email: 'jessica@example.com', registrationDate: '2024-08-05', kitPurchased: true },
  { id: 'att-11', eventId: '26023031', name: 'Kevin Hart', email: 'kevin@example.com', registrationDate: '2024-08-07', kitPurchased: true },
  { id: 'att-12', eventId: '26023043', name: 'Laura Croft', email: 'laura@example.com', registrationDate: '2024-08-09', kitPurchased: false },
  { id: 'att-13', eventId: '26024593', name: 'Michael Jordan', email: 'michael@example.com', registrationDate: '2024-08-11', kitPurchased: true },
  { id: 'att-14', eventId: '26025538', name: 'Nancy Drew', email: 'nancy@example.com', registrationDate: '2024-08-13', kitPurchased: true },
  { id: 'att-15', eventId: '26025572', name: 'Olivia Pope', email: 'olivia@example.com', registrationDate: '2024-08-15', kitPurchased: false },
  { id: 'att-16', eventId: '26025715', name: 'Peter Parker', email: 'peter@example.com', registrationDate: '2024-08-17', kitPurchased: true },
  { id: 'att-17', eventId: '26025942', name: 'Quinn Fabray', email: 'quinn@example.com', registrationDate: '2024-08-19', kitPurchased: true },
  { id: 'att-18', eventId: '26030951', name: 'Rachel Green', email: 'rachel@example.com', registrationDate: '2024-08-21', kitPurchased: false },
  { id: 'att-19', eventId: '26031000', name: 'Steve Rogers', email: 'steve@example.com', registrationDate: '2024-08-23', kitPurchased: true },
  { id: 'att-20', eventId: '26031015', name: 'Tina Fey', email: 'tina@example.com', registrationDate: '2024-08-25', kitPurchased: true },
  { id: 'att-21', eventId: '26031225', name: 'Ursula K. Le Guin', email: 'ursula@example.com', registrationDate: '2024-08-27', kitPurchased: false },
  { id: 'att-22', eventId: '26031232', name: 'Victor Stone', email: 'victor@example.com', registrationDate: '2024-08-29', kitPurchased: true },
  { id: 'att-23', eventId: '26031495', name: 'Wanda Maximoff', email: 'wanda@example.com', registrationDate: '2024-09-01', kitPurchased: true },
  { id: 'att-24', eventId: '26031583', name: 'Xavier Woods', email: 'xavier@example.com', registrationDate: '2024-09-03', kitPurchased: false },
  { id: 'att-25', eventId: '26031688', name: 'Yara Shahidi', email: 'yara@example.com', registrationDate: '2024-09-05', kitPurchased: true },
  { id: 'att-26', eventId: '26031921', name: 'Zoe Saldana', email: 'zoe@example.com', registrationDate: '2024-09-07', kitPurchased: true },
  { id: 'att-27', eventId: '27397901', name: 'Adam Sandler', email: 'adam@example.com', registrationDate: '2024-09-09', kitPurchased: false },
  { id: 'att-28', eventId: '27397905', name: 'Betty White', email: 'betty@example.com', registrationDate: '2024-09-11', kitPurchased: true },
  { id: 'att-29', eventId: '27397917', name: 'Chris Evans', email: 'chris@example.com', registrationDate: '2024-09-13', kitPurchased: true },
  { id: 'att-30', eventId: '27398059', name: 'Dwayne Johnson', email: 'dwayne@example.com', registrationDate: '2024-09-15', kitPurchased: false },
  { id: 'att-31', eventId: '27398063', name: 'Emma Watson', email: 'emma@example.com', registrationDate: '2024-09-17', kitPurchased: true },
  { id: 'att-32', eventId: '27398155', name: 'Frank Sinatra', email: 'frank@example.com', registrationDate: '2024-09-19', kitPurchased: true },
  { id: 'att-33', eventId: '27398162', name: 'Gal Gadot', email: 'gal@example.com', registrationDate: '2024-09-21', kitPurchased: false },
  { id: 'att-34', eventId: '27398192', name: 'Hugh Jackman', email: 'hugh@example.com', registrationDate: '2024-09-23', kitPurchased: true },
  { id: 'att-35', eventId: '27398232', name: 'Idris Elba', email: 'idris@example.com', registrationDate: '2024-09-25', kitPurchased: true },
  { id: 'att-36', eventId: '27398267', name: 'Julia Roberts', email: 'julia@example.com', registrationDate: '2024-09-27', kitPurchased: false },
  { id: 'att-37', eventId: '27398568', name: 'Keanu Reeves', email: 'keanu@example.com', registrationDate: '2024-09-29', kitPurchased: true },
  { id: 'att-38', eventId: '27398734', name: 'Liam Neeson', email: 'liam@example.com', registrationDate: '2024-10-01', kitPurchased: true },
  { id: 'att-39', eventId: '27398821', name: 'Meryl Streep', email: 'meryl@example.com', registrationDate: '2024-10-03', kitPurchased: false },
  { id: 'att-40', eventId: '27398885', name: 'Natalie Portman', email: 'natalie@example.com', registrationDate: '2024-10-05', kitPurchased: true },
  { id: 'att-41', eventId: '27398957', name: 'Orlando Bloom', email: 'orlando@example.com', registrationDate: '2024-10-07', kitPurchased: true }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  const eventAttendees = attendees.filter(att => att.eventId === eventId);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(eventAttendees);
}