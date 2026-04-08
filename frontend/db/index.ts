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

  // Check if user already exists
  const existing = await sql`
    SELECT id FROM fitness.users WHERE clerk_id = ${clerkId}
  `;

  if (existing.length > 0) {
    await sql`
      UPDATE fitness.users SET name = ${name}, email = ${email}
      WHERE clerk_id = ${clerkId}
    `;
    return existing[0].id as string;
  }

  // New user — check for orphaned runs (runs whose user_id has no owner)
  const orphan = await sql`
    SELECT DISTINCT r.user_id
    FROM fitness.runs r
    LEFT JOIN fitness.users u ON u.id = r.user_id
    WHERE u.id IS NULL
    LIMIT 1
  `;

  let userId: string;

  if (orphan.length > 0) {
    // Claim the orphaned UUID so existing data becomes visible
    userId = orphan[0].user_id as string;
    await sql`
      INSERT INTO fitness.users (id, clerk_id, name, email)
      VALUES (${userId}::uuid, ${clerkId}, ${name}, ${email})
    `;
  } else {
    // Fresh insert with a new UUID
    const result = await sql`
      INSERT INTO fitness.users (clerk_id, name, email)
      VALUES (${clerkId}, ${name}, ${email})
      RETURNING id
    `;
    userId = result[0].id as string;
  }

  return userId;
}
