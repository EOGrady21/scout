import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export async function getLocations() {
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
  return rows;
}

export async function getLocationById(id: string) {
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
  return rows[0] ?? null;
}

export async function getConditionsByLocationId(locationId: string) {
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
  return rows;
}

export async function createLocation(data: {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  created_by: string;
}) {
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
  return rows[0];
}

export async function createCondition(data: {
  location_id: string;
  user_id: string;
  condition_date: string;
  rating: number;
  description: string;
  photo_url: string | null;
}) {
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
  return rows[0];
}

export async function upsertUser(data: {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}) {
  const rows = await sql`
    INSERT INTO users (id, name, email, image)
    VALUES (${data.id}, ${data.name}, ${data.email}, ${data.image})
    ON CONFLICT (id) DO UPDATE
      SET name  = EXCLUDED.name,
          email = EXCLUDED.email,
          image = EXCLUDED.image
    RETURNING id, name, email, image, created_at
  `;
  return rows[0];
}

export async function getConditionsByUserId(userId: string) {
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
  return rows;
}
