import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { validateBody, approvalRequestSchema, approvalDecisionSchema } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, approvalRequestSchema);
  if (data instanceof NextResponse) return data;

  try {
    const { id } = await params;
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.tasks)
      .set({
        approvalRequired: true,
        approver: data.approver,
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, approvalDecisionSchema);
  if (data instanceof NextResponse) return data;

  try {
    const { id } = await params;
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.tasks)
      .set({
        approvalStatus: data.status,
        approvalComment: data.comment || null,
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
