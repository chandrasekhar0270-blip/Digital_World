import { neon } from "@neondatabase/serverless";

export function getDB() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");
  return neon(url);
}

/**
 * Ensures fitness.users table exists, upserts the user by Clerk ID,
 * and on first login claims any orphaned runs/goals (seed data).
 * Returns the internal UUID used as user_id in fitness.runs / fitness.goals.
 */
export async function getOrCreateUser(
  clerkId: string,
  name: string,
  email: string
): Promise<string> {
  const sql = getDB();

  // Ensure users table exists
  await sql`
    CREATE TABLE IF NOT EXISTS fitness.users (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      clerk_id   TEXT UNIQUE NOT NULL,
      name       TEXT,
      email      TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Upsert user — safe against concurrent first-load requests for new users
  const result = await sql`
    INSERT INTO fitness.users (clerk_id, name, email)
    VALUES (${clerkId}, ${name}, ${email})
    ON CONFLICT (clerk_id) DO UPDATE
      SET name  = EXCLUDED.name,
          email = EXCLUDED.email
    RETURNING id
  `;

  return result[0].id as string;
}
