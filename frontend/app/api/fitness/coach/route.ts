// app/api/coach/route.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { getDB } from "@/db";
import { getCoachingInsights } from "../../../fitness/lib/claude";
import { NextResponse } from "next/server";

// POST /api/coach — get AI coaching analysis
export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const user = await currentUser();
    const userName = user?.firstName || "Runner";

    const sql = getDB();

    // Get user ID
    const users = await sql`
      SELECT id FROM fitness.users WHERE clerk_id = ${clerkId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No user found. Log a run first." },
        { status: 404 }
      );
    }

    const userId = users[0].id;

    // Fetch ALL runs (for ITD/YTD/MTD analysis)
    const runs = await sql`
      SELECT
        run_date AS "date",
        distance_km AS "distanceKm",
        duration_sec AS "durationSec",
        speed_kmh AS "speedKmh",
        pace_min_km AS "paceMinKm"
      FROM fitness.runs
      WHERE user_id = ${userId}
      ORDER BY run_date ASC
    `;

    const formattedRuns = runs.map((r: any) => ({
      date: new Date(r.date).toISOString().split("T")[0],
      distanceKm: parseFloat(r.distanceKm),
      durationSec: parseInt(r.durationSec),
      speedKmh: parseFloat(r.speedKmh),
      paceMinKm: parseFloat(r.paceMinKm),
    }));

    // Fetch goals
    const goals = await sql`
      SELECT
        target_type AS "targetType",
        target_value AS "targetValue",
        deadline
      FROM fitness.goals
      WHERE user_id = ${userId}
    `;

    const formattedGoals = goals.map((g: any) => ({
      targetType: g.targetType,
      targetValue: parseFloat(g.targetValue),
      deadline: g.deadline
        ? new Date(g.deadline).toISOString().split("T")[0]
        : null,
    }));

    // Get AI coaching insights
    const insights = await getCoachingInsights({
      allRuns: formattedRuns,
      goals: formattedGoals,
      userName,
    });

    return NextResponse.json({ insights, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("POST /api/coach error:", error);
    return NextResponse.json(
      { error: "Failed to generate coaching insights. Check your ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }
}
