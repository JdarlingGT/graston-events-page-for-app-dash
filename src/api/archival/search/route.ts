import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

interface SearchResult {
  id: string;
  type: 'event' | 'order' | 'attendee';
  title: string;
  description: string;
  date: string;
}

// Function to generate mock search results
const generateMockResults = (count: number, type: string, query: string): SearchResult[] => {
  return Array.from({ length: count }, (_, i) => {
    const resultType = type === 'all' ? faker.helpers.arrayElement(['event', 'order', 'attendee']) : type;
    let title = '';
    let description = '';

    switch (resultType) {
      case 'event':
        title = `Event: ${faker.company.catchPhrase()} | ${faker.location.city()}`;
        description = `Completed event focusing on ${query || faker.commerce.department()}. Instructor: ${faker.person.fullName()}. Total attendees: ${faker.number.int({ min: 20, max: 100 })}.`;
        break;
      case 'order':
        title = `Order #${faker.string.alphanumeric(8).toUpperCase()} for ${faker.person.fullName()}`;
        description = `Purchase of "${faker.commerce.productName()}" for event "${query || faker.company.catchPhrase()}". Total: $${faker.commerce.price()}.`;
        break;
      case 'attendee':
        title = `Attendee: ${faker.person.fullName()}`;
        description = `Attended event "${query || faker.company.catchPhrase()}". License: ${faker.string.alphanumeric(10).toUpperCase()}. Email: ${faker.internet.email()}.`;
        break;
    }

    return {
      id: faker.string.uuid(),
      type: resultType as any,
      title,
      description,
      date: faker.date.past({ years: 3 }).toISOString(),
    };
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!q) {
    return NextResponse.json({ data: [], pagination: {} });
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));

  // Simulate a total number of results for pagination
  const totalResults = faker.number.int({ min: 25, max: 150 });
  const totalPages = Math.ceil(totalResults / pageSize);

  const results = generateMockResults(pageSize, type, q);

  return NextResponse.json({
    data: results,
    pagination: {
      page,
      pageSize,
      totalPages,
      totalResults,
    },
  });
}