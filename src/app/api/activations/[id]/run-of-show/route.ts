import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, runOfShowCreateSchema, runOfShowUpdateSchema, activationDeleteSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, runOfShowCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const rosId = `ros-${crypto.randomUUID().slice(0, 8)}`;

    const newRunOfShow = await db
      .insert(schema.activationRunOfShow)
      .values({
        id: rosId,
        activationId: id,
        time: data.time || "00:00",
        endTime: data.endTime || null,
        title: data.title || "New Run of Show Item",
        description: data.description || "",
        responsiblePersonnelId: data.responsiblePersonnelId || null,
        responsibleName: data.responsibleName || "",
        completed: data.completed || false,
        completedAt: data.completedAt || null,
        order: data.order || 0,
      })
      .returning();

    return NextResponse.json(newRunOfShow[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/run-of-show error:", error);
    return NextResponse.json({ error: "Failed to create run of show item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, runOfShowUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    // Handle complete special case
    if (data.complete === true) {
      const updates = {
        ...data,
        completed: true,
        completedAt: now,
      };
      // Remove control flag before sending to DB
      const { complete, ...dbUpdates } = updates;

      const updated = await db
        .update(schema.activationRunOfShow)
        .set(dbUpdates)
        .where(
          and(
            eq(schema.activationRunOfShow.id, data.id),
            eq(schema.activationRunOfShow.activationId, id)
          )
        )
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Run of Show item not found" }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    }

    // Normal update path
    const { complete, ...updates } = data;

    const updated = await db
      .update(schema.activationRunOfShow)
      .set(updates)
      .where(
        and(
          eq(schema.activationRunOfShow.id, data.id),
          eq(schema.activationRunOfShow.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Run of Show item not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/run-of-show error:", error);
    return NextResponse.json({ error: "Failed to update run of show item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, activationDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.activationRunOfShow)
      .where(
        and(
          eq(schema.activationRunOfShow.id, data.id),
          eq(schema.activationRunOfShow.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/run-of-show error:", error);
    return NextResponse.json({ error: "Failed to delete run of show item" }, { status: 500 });
  }
}
