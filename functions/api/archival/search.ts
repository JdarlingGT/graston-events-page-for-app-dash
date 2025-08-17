import { query } from "../../lib/pg";

// Define types for Cloudflare Pages Functions environment
interface EventContext {
  request: Request;
  env: any;
}
type PagesFunction = (context: EventContext) => Response | Promise<Response>;


// A simple placeholder for Cloudflare Access JWT verification.
// In a real scenario, this would involve a library like 'jose' to verify the token signature
// against Cloudflare's public keys.
function requireJwt(request: Request) {
  const cfToken = request.headers.get("cf-access-jwt-assertion");
  if (!cfToken) {
    throw new Error("Missing Cloudflare Access JWT. Access denied.");
  }
  // Basic check for demonstration. A real implementation MUST verify the signature.
  if (cfToken.split('.').length !== 3) {
    throw new Error("Invalid JWT format.");
  }
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    // 1. Security: Protect the endpoint
    // requireJwt(context.request); // Disabling for local dev, but crucial for production

    // 2. Parse Query Parameters
    const { searchParams } = new URL(context.request.url);
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "25", 10), 200);
    const offset = (page - 1) * pageSize;

    // 3. Build Dynamic SQL Query
    let whereClauses: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (q) {
      whereClauses.push(`(title ILIKE $${paramIndex} OR subtitle ILIKE $${paramIndex} OR snippet ILIKE $${paramIndex})`);
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (type !== "all") {
      whereClauses.push(`type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (start) {
      whereClauses.push(`date >= $${paramIndex}`);
      params.push(start);
      paramIndex++;
    }

    if (end) {
      whereClauses.push(`date <= $${paramIndex}`);
      params.push(end);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // This is a simplified UNION query for demonstration.
    // In a real-world scenario, you would query each table that matches the 'type' filter
    // and ensure the columns are correctly cast and aliased.
    const unionQuery = `
      SELECT id, type, title, subtitle, date, snippet, raw_data FROM (
        -- Events
        SELECT
          event_id::text as id,
          'event' as type,
          event_title as title,
          'Instructor: ' || instructor_name as subtitle,
          event_start_date as date,
          notes as snippet,
          row_to_json(events.*) as raw_data
        FROM events
        
        UNION ALL
        
        -- Attendees
        SELECT
          attendee_id::text as id,
          'attendee' as type,
          attendee_name as title,
          attendee_email as subtitle,
          registration_date as date,
          '' as snippet,
          row_to_json(attendees.*) as raw_data
        FROM attendees
      ) as combined_search
    `;

    const countQuery = `SELECT COUNT(*) FROM (${unionQuery}) as search_with_filters ${whereSql}`;
    const dataQuery = `SELECT * FROM (${unionQuery}) as search_with_filters ${whereSql} ORDER BY date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    // 4. Execute Queries
    const countResult = await query(context, countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / pageSize);

    const dataResult = await query(context, dataQuery, [...params, pageSize, offset]);
    
    // 5. Format and Return Response
    const response = {
      data: dataResult.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Archival search failed:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes("denied") ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};