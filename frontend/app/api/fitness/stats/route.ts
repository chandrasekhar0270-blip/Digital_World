// app/api/stats/route.ts
import { auth } from "@clerk/nextjs/server";
import { getDB } from "@/db";
import { NextResponse } from "next/server";

// GET /api/stats — aggregated run statistics
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const sql = getDB();

    const users = await sql`
      SELECT id FROM fitness.users WHERE clerk_id = ${clerkId}
    `;

    if (users.length === 0) {
      return NextResponse.json({
        totalRuns: 0,
        totalDistanceKm: 0,
        totalDurationSec: 0,
        avgPaceMinKm: 0,
        avgSpeedKmh: 0,
        weekDistanceKm: 0,
        weekRuns: 0,
        bestPace: null,
        longestRun: null,
        topSpeed: null,
      });
    }

    const userId = users[0].id;

    // All-time stats
    const allTime = await sql`
      SELECT
        COUNT(*)::int AS "totalRuns",
        COALESCE(SUM(distance_km), 0)::float AS "totalDistanceKm",
        COALESCE(SUM(duration_sec), 0)::int AS "totalDurationSec",
        COALESCE(MIN(pace_min_km), 0)::float AS "bestPace",
        COALESCE(MAX(distance_km), 0)::float AS "longestRun",
        COALESCE(MAX(speed_kmh), 0)::float AS "topSpeed"
      FROM fitness.runs
      WHERE user_id = ${userId}
    `;

    // This week stats
    const weekStats = await sql`
      SELECT
        COUNT(*)::int AS "weekRuns",
        COALESCE(SUM(distance_km), 0)::float AS "weekDistanceKm"
      FROM fitness.runs
      WHERE user_id = ${userId}
        AND run_date >= CURRENT_DATE - INTERVAL '7 days'
    `;

    const stats = allTime[0];
    const week = weekStats[0];

    const avgPace =
      stats.totalRuns > 0
        ? (stats.totalDurationSec / 60) / stats.totalDistanceKm
        : 0;
    const avgSpeed =
      stats.totalRuns > 0
        ? stats.totalDistanceKm / (stats.totalDurationSec / 3600)
        : 0;

    return NextResponse.json({
      ...stats,
      avgPaceMinKm: Math.round(avgPace * 100) / 100,
      avgSpeedKmh: Math.round(avgSpeed * 10) / 10,
      weekDistanceKm: week.weekDistanceKm,
      weekRuns: week.weekRuns,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
