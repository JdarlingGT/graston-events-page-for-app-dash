import { Pool } from "pg";
import { getDbSecret } from "./aws-secrets";

// Define a generic type for the Cloudflare environment context
interface EventContext<Env = any, Params = any, Data = any> {
  env: Env;
}

// Create a single, module-scoped pool to be reused across requests.
let pool: Pool;

/**
 * Initializes the PostgreSQL connection pool using credentials from AWS Secrets Manager.
 * This function is designed to be called once per worker instance.
 * @param context - The Cloudflare Pages function context.
 * @returns An initialized PostgreSQL Pool instance.
 */
async function getPool(context: EventContext): Promise<Pool> {
  if (!pool) {
    const secret = await getDbSecret(context);
    pool = new Pool({
      host: secret.host,
      port: secret.port,
      user: secret.username,
      password: secret.password,
      database: "postgres", // Assuming a default database name
      ssl: {
        rejectUnauthorized: true, // Enforce TLS connection to RDS
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Executes a parameterized SQL query against the RDS database.
 * @param context - The Cloudflare Pages function context.
 * @param sql - The SQL query string with placeholders ($1, $2, etc.).
 * @param params - An array of parameters to safely substitute into the query.
 * @returns The result of the query.
 */
export async function query(context: EventContext, sql: string, params: any[] = []) {
  const dbPool = await getPool(context);
  const client = await dbPool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}