import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import type { Location, Condition, User } from "@/types";

// Lazily initialise the Neon client so the module can be imported at build
// time even when DATABASE_URL is not yet set (e.g. during `next build` CI).
let _sql: NeonQueryFunction<false, false> | undefined;
function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    _sql = neon(url);
  }
  return _sql;
}

export async function getLocations(): Promise<Location[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      l.id,
      l.name,
      l.description,
      l.latitude,
      l.longitude,
      l.created_by,
      l.created_at,
      COUNT(c.id)::int AS condition_count,
      AVG(c.rating)::float AS latest_rating
    FROM locations l
    LEFT JOIN conditions c ON c.location_id = l.id
    GROUP BY l.id
    ORDER BY l.created_at DESC
  `;
  return rows as unknown as Location[];
}

export async function getLocationById(id: string): Promise<Location | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      l.id,
      l.name,
      l.description,
      l.latitude,
      l.longitude,
      l.created_by,
      l.created_at
    FROM locations l
    WHERE l.id = ${id}
  `;
  return (rows as unknown as Location[])[0] ?? null;
}

export async function getConditionsByLocationId(locationId: string): Promise<Condition[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      c.id,
      c.location_id,
      c.user_id,
      c.condition_date,
      c.rating,
      c.description,
      c.photo_url,
      c.created_at,
      u.name AS user_name,
      u.image AS user_image
    FROM conditions c
    LEFT JOIN users u ON u.id = c.user_id
    WHERE c.location_id = ${locationId}
    ORDER BY c.condition_date DESC
    LIMIT 20
  `;
  return rows as unknown as Condition[];
}

export async function createLocation(data: {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_by: string;
}): Promise<Location> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO locations (name, description, latitude, longitude, geom, created_by)
    VALUES (
      ${data.name},
      ${data.description},
      ${data.latitude},
      ${data.longitude},
      ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326),
      ${data.created_by}
    )
    RETURNING id, name, description, latitude, longitude, created_by, created_at
  `;
  return (rows as unknown as Location[])[0];
}

export async function createCondition(data: {
  location_id: string;
  user_id: string;
  condition_date: string;
  rating: number;
  description: string;
  photo_url: string | null;
}): Promise<Condition> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO conditions (location_id, user_id, condition_date, rating, description, photo_url)
    VALUES (
      ${data.location_id},
      ${data.user_id},
      ${data.condition_date},
      ${data.rating},
      ${data.description},
      ${data.photo_url}
    )
    RETURNING id, location_id, user_id, condition_date, rating, description, photo_url, created_at
  `;
  return (rows as unknown as Condition[])[0];
}

export async function upsertUser(data: {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}): Promise<User> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO users (id, name, email, image)
    VALUES (${data.id}, ${data.name}, ${data.email}, ${data.image})
    ON CONFLICT (id) DO UPDATE
      SET name  = EXCLUDED.name,
          email = EXCLUDED.email,
          image = EXCLUDED.image
    RETURNING id, name, email, image, created_at
  `;
  return (rows as unknown as User[])[0];
}

export async function getConditionsByUserId(userId: string): Promise<(Condition & { location_name: string })[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT
      c.id,
      c.location_id,
      c.user_id,
      c.condition_date,
      c.rating,
      c.description,
      c.photo_url,
      c.created_at,
      l.name AS location_name
    FROM conditions c
    JOIN locations l ON l.id = c.location_id
    WHERE c.user_id = ${userId}
    ORDER BY c.created_at DESC
  `;
  return rows as unknown as (Condition & { location_name: string })[];
}
