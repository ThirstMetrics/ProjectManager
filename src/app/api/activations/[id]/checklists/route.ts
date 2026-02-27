import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, checklistCreateSchema, checklistUpdateSchema, activationDeleteSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, checklistCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const checklistId = `chk-${crypto.randomUUID().slice(0, 8)}`;

    const newChecklist = await db
      .insert(schema.activationChecklists)
      .values({
        id: checklistId,
        activationId: id,
        category: data.category || "setup",
        title: data.title || "New Checklist Item",
        description: data.description || "",
        required: data.required || false,
        completed: data.completed || false,
        completedBy: data.completedBy || null,
        completedAt: data.completedAt || null,
        dueDate: data.dueDate || null,
        order: data.order || 0,
      })
      .returning();

    return NextResponse.json(newChecklist[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/checklists error:", error);
    return NextResponse.json({ error: "Failed to create checklist item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, checklistUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    // Handle toggle special case
    if (data.toggle === true) {
      const toggleValue = !data.completed; // Toggle based on current value in body
      const updates = {
        ...data,
        completed: toggleValue,
        completedBy: toggleValue ? (data.completedBy || "system") : null,
        completedAt: toggleValue ? now : null,
      };
      // Remove control flag before sending to DB
      const { toggle, ...dbUpdates } = updates;

      const updated = await db
        .update(schema.activationChecklists)
        .set(dbUpdates)
        .where(
          and(
            eq(schema.activationChecklists.id, data.id),
            eq(schema.activationChecklists.activationId, id)
          )
        )
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    }

    // Normal update path
    const { toggle, ...updates } = data;

    const updated = await db
      .update(schema.activationChecklists)
      .set(updates)
      .where(
        and(
          eq(schema.activationChecklists.id, data.id),
          eq(schema.activationChecklists.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/checklists error:", error);
    return NextResponse.json({ error: "Failed to update checklist item" }, { status: 500 });
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
      .delete(schema.activationChecklists)
      .where(
        and(
          eq(schema.activationChecklists.id, data.id),
          eq(schema.activationChecklists.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/checklists error:", error);
    return NextResponse.json({ error: "Failed to delete checklist item" }, { status: 500 });
  }
}
