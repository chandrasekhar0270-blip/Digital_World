// app/api/runs/[id]/route.ts
import { auth } from "@clerk/nextjs/server";
import { getDB } from "@/db";
import { NextResponse } from "next/server";

// DELETE /api/runs/:id — delete a specific run
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { id: runId } = await params;

    const sql = getDB();

    // Get the user's Neon ID
    const users = await sql`
      SELECT id FROM fitness.users WHERE clerk_id = ${clerkId}
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = users[0].id;

    // Delete only if the run belongs to this user
    const result = await sql`
      DELETE FROM fitness.runs
      WHERE id = ${runId}::uuid AND user_id = ${userId}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: runId });
  } catch (error) {
    console.error("DELETE /api/runs/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
