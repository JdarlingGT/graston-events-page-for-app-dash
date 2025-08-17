import { getPool } from "../../lib/pg";
import { requireJwt } from "../../lib/auth";
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Authenticate the request (assuming requireJwt handles this)
    // await requireJwt(request); 

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const pool = await getPool();
    let queryText = 'SELECT id, type, title, description, date FROM archival_data WHERE TRUE';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (q) {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${q}%`);
      paramIndex++;
    }
    if (type !== 'all') {
      queryText += ` AND type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }
    if (start) {
      queryText += ` AND date >= $${paramIndex}`;
      queryParams.push(start);
      paramIndex++;
    }
    if (end) {
      queryText += ` AND date <= $${paramIndex}`;
      queryParams.push(end);
      paramIndex++;
    }

    // Add pagination
    const countQueryText = `SELECT COUNT(*) FROM (${queryText}) AS subquery`;
    const countResult = await pool.query(countQueryText, queryParams);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / pageSize);

    queryText += ` ORDER BY date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, (page - 1) * pageSize);

    const result = await pool.query(queryText, queryParams);

    return NextResponse.json({
      data: result.rows,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Archival search error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}