import { Pool } from 'pg';
import type { EventContext } from '@netlify/functions';

// Create a single, module-scoped pool to be reused across requests.
let pool: Pool;

/**
 * Get or create a PostgreSQL connection pool.
 * This function ensures we reuse the same pool across function invocations
 * to avoid connection exhaustion.
 */
async function getPool(context: EventContext): Promise<Pool> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 5, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export { getPool };