import { Pool } from 'pg';

// Create a single, module-scoped pool to be reused across requests.
let pool: InstanceType<typeof Pool>;

/**
 * Get a PostgreSQL connection pool.
 * Initializes the pool if it doesn't already exist.
 * @returns {Promise<InstanceType<typeof Pool>>} The PostgreSQL connection pool.
 */
async function getPool(): Promise<InstanceType<typeof Pool>> {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

export { getPool };