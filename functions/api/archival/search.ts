import { query } from "../../lib/pg";
import { requireJwt } from "../../lib/auth";

// Define types for Cloudflare Pages Functions environment
interface EventContext<Env = any, Params = any, Data = any> {
  request: Request;
  env: Env;
  params: Params;
  data: Data;
}
type PagesFunction<Env = any, Params = any, Data = any> = (context: EventContext<Env, Params, Data>) => Response | Promise<Response>;

// Define a mapping from API type to database table and columns
const typeMapping: Record<string, { table: string; idCol: string; titleCol: string; descCol: string; dateCol: string; searchCols: string[] }> = {
  event: { table: 'archived_events', idCol: 'event_id', titleCol: 'event_name', descCol: 'venue_name', dateCol: 'event_date', searchCols: ['event_name', 'venue_name', 'instructor_name'] },
  order: { table: 'archived_orders', idCol: 'order_id', titleCol: 'order_id::text', descCol: 'customer_name', dateCol: 'order_date', searchCols: ['order_id::text', 'customer_name', 'customer_email'] },
  attendee: { table: 'archived_attendees', idCol: 'attendee_id', titleCol: 'attendee_name', descCol: 'attendee_email', dateCol: 'registration_date', searchCols: ['attendee_name', 'attendee_email', 'company_name'] },
};

export const onRequestGet: PagesFunction = async (context) => {
  try {
    // requireJwt(context.request); // Security first!

    const { searchParams } = new URL(context.request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "25", 10), 200);
    const offset = (page - 1) * pageSize;
    const [sortCol = 'date', sortDir = 'desc'] = (searchParams.get("sort") || 'date:desc').split(':');

    const typesToQuery = type === 'all' ? Object.keys(typeMapping) : [type];
    const subQueries = [];
    let params: any[] = [];
    let paramIndex = 1;

    for (const t of typesToQuery) {
      const mapping = typeMapping[t];
      if (!mapping) continue;

      let whereClauses: string[] = [];
      let subParams: any[] = [];

      if (q) {
        const searchClause = mapping.searchCols.map(col => `${col} ILIKE $${paramIndex}`).join(' OR ');
        whereClauses.push(`(${searchClause})`);
        subParams.push(`%${q}%`);
      }
      if (start) {
        whereClauses.push(`${mapping.dateCol} >= $${paramIndex + subParams.length}`);
        subParams.push(start);
      }
      if (end) {
        whereClauses.push(`${mapping.dateCol} <= $${paramIndex + subParams.length}`);
        subParams.push(end);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
      
      subQueries.push(`
        SELECT
          ${mapping.idCol}::text as id,
          '${t}' as type,
          ${mapping.titleCol} as title,
          ${mapping.descCol} as description,
          ${mapping.dateCol} as date
        FROM ${mapping.table}
        ${whereSql}
      `);
      params.push(...subParams);
      paramIndex += subParams.length;
    }

    if (subQueries.length === 0) {
      return new Response(JSON.stringify({ data: [], pagination: { page, pageSize, total: 0, totalPages: 0 } }), { headers: { "Content-Type": "application/json" } });
    }

    const fullQuery = subQueries.join(' UNION ALL ');
    
    const countQuery = `SELECT COUNT(*) FROM (${fullQuery}) as search_results`;
    const dataQuery = `SELECT * FROM (${fullQuery}) as search_results ORDER BY ${sortCol} ${sortDir === 'asc' ? 'ASC' : 'DESC'} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const countResult = await query(context, countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / pageSize);

    const dataResult = await query(context, dataQuery, [...params, pageSize, offset]);

    return new Response(JSON.stringify({ data: dataResult.rows, pagination: { page, pageSize, total, totalPages } }), { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Archival search failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: error.message.startsWith("401") ? 401 : 500, headers: { "Content-Type": "application/json" } });
  }
};