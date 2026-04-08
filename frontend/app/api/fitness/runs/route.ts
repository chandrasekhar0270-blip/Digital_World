import { auth, currentUser } from "@clerk/nextjs/server";
import { getDB, getOrCreateUser } from "@/db";
import { NextResponse } from "next/server";

async function resolveUser(clerkId: string): Promise<string> {
  const user = await currentUser();
  const name  = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Runner";
  const email = user?.emailAddresses?.[0]?.emailAddress || `${clerkId}@temp.com`;
  return getOrCreateUser(clerkId, name, email);
}

// GET /api/fitness/runs
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const userId = await resolveUser(clerkId);

    const sql = getDB();
    const runs = await sql`
      SELECT
        id,
        distance_km   AS "distanceKm",
        duration_sec  AS "durationSec",
        speed_kmh     AS "speedKmh",
        pace_min_km   AS "paceMinKm",
        run_date      AS "date",
        created_at    AS "createdAt"
      FROM fitness.runs
      WHERE user_id = ${userId}::uuid
      ORDER BY run_date ASC
    `;

    const formatted = runs.map((r: any) => ({
      ...r,
      distanceKm: parseFloat(r.distanceKm),
      durationSec: parseInt(r.durationSec),
      speedKmh:    parseFloat(r.speedKmh),
      paceMinKm:   parseFloat(r.paceMinKm),
      date: new Date(r.date).toISOString().split("T")[0],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/fitness/runs error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/fitness/runs
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const userId = await resolveUser(clerkId);
    const body = await request.json();
    const { date, distanceKm, durationSec } = body;

    if (!date || !distanceKm || !durationSec)
      return NextResponse.json({ error: "Missing required fields: date, distanceKm, durationSec" }, { status: 400 });

    if (distanceKm <= 0 || durationSec <= 0)
      return NextResponse.json({ error: "Distance and duration must be positive" }, { status: 400 });

    const sql = getDB();
    const result = await sql`
      INSERT INTO fitness.runs (user_id, distance_km, duration_sec, run_date)
      VALUES (${userId}::uuid, ${distanceKm}, ${durationSec}, ${date})
      RETURNING
        id,
        distance_km  AS "distanceKm",
        duration_sec AS "durationSec",
        speed_kmh    AS "speedKmh",
        pace_min_km  AS "paceMinKm",
        run_date     AS "date"
    `;

    const run = {
      ...result[0],
      distanceKm: parseFloat(result[0].distanceKm),
      durationSec: parseInt(result[0].durationSec),
      speedKmh:    parseFloat(result[0].speedKmh),
      paceMinKm:   parseFloat(result[0].paceMinKm),
      date: new Date(result[0].date).toISOString().split("T")[0],
    };

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error("POST /api/fitness/runs error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
