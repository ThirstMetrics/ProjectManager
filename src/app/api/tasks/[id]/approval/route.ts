import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.tasks)
      .set({
        approvalRequired: true,
        approver: body.approver,
        approvalStatus: "pending",
        approvalRequestedAt: now,
        updatedAt: now,
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 201 });
  } catch (error) {
    console.error("Error requesting task approval:", error);
    return NextResponse.json(
      { error: "Failed to request task approval" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.tasks)
      .set({
        approvalStatus: body.status,
        approvalComment: body.comment,
        updatedAt: now,
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating task approval:", error);
    return NextResponse.json(
      { error: "Failed to update task approval" },
      { status: 500 }
    );
  }
}
