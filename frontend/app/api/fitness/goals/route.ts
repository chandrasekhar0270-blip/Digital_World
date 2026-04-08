import { auth, currentUser } from "@clerk/nextjs/server";
import { getDB, getOrCreateUser } from "@/db"; // currentUser used in resolveUser
import { NextResponse } from "next/server";

async function resolveUser(clerkId: string): Promise<string> {
  const user = await currentUser();
  const name  = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Runner";
  const email = user?.emailAddresses?.[0]?.emailAddress || `${clerkId}@temp.com`;
  return getOrCreateUser(clerkId, name, email);
}

// GET /api/fitness/goals
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const userId = await resolveUser(clerkId);

    const sql = getDB();
    const goals = await sql`
      SELECT
        id,
        target_type  AS "targetType",
        target_value AS "targetValue",
        deadline,
        created_at   AS "createdAt"
      FROM fitness.goals
      WHERE user_id = ${userId}::uuid
      ORDER BY created_at DESC
    `;

    const formatted = goals.map((g: any) => ({
      ...g,
      targetValue: parseFloat(g.targetValue),
      deadline: g.deadline ? new Date(g.deadline).toISOString().split("T")[0] : null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/fitness/goals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/fitness/goals
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const userId = await resolveUser(clerkId);
    const body = await request.json();
    const { targetType, targetValue, deadline } = body;

    if (!targetType || !targetValue)
      return NextResponse.json({ error: "Missing required fields: targetType, targetValue" }, { status: 400 });

    const validTypes = ["weekly_km", "pace", "streak"];
    if (!validTypes.includes(targetType))
      return NextResponse.json({ error: `targetType must be one of: ${validTypes.join(", ")}` }, { status: 400 });

    if (targetValue <= 0)
      return NextResponse.json({ error: "targetValue must be positive" }, { status: 400 });

    const sql = getDB();
    const result = await sql`
      INSERT INTO fitness.goals (user_id, target_type, target_value, deadline)
      VALUES (${userId}::uuid, ${targetType}, ${targetValue}, ${deadline || null})
      RETURNING
        id,
        target_type  AS "targetType",
        target_value AS "targetValue",
        deadline,
        created_at   AS "createdAt"
    `;

    const goal = {
      ...result[0],
      targetValue: parseFloat(result[0].targetValue),
      deadline: result[0].deadline ? new Date(result[0].deadline).toISOString().split("T")[0] : null,
    };

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("POST /api/fitness/goals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/fitness/goals?id=<uuid>
export async function DELETE(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get("id");
    if (!goalId) return NextResponse.json({ error: "Missing goal id" }, { status: 400 });

    const userId = await resolveUser(clerkId);
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const sql = getDB();
    const result = await sql`
      DELETE FROM fitness.goals
      WHERE id = ${goalId}::uuid AND user_id = ${userId}::uuid
      RETURNING id
    `;

    if (result.length === 0)
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    return NextResponse.json({ deleted: true, id: goalId });
  } catch (error) {
    console.error("DELETE /api/fitness/goals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
