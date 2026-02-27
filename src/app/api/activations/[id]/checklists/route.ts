import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    const checklistId = `chk-${crypto.randomUUID().slice(0, 8)}`;

    const newChecklist = await db
      .insert(schema.activationChecklists)
      .values({
        id: checklistId,
        activationId: id,
        category: body.category || "setup",
        title: body.title || "New Checklist Item",
        description: body.description || "",
        required: body.required || false,
        completed: body.completed || false,
        completedBy: body.completedBy || null,
        completedAt: body.completedAt || null,
        dueDate: body.dueDate || null,
        order: body.order || 0,
      })
      .returning();

    return NextResponse.json(newChecklist[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/checklists error:", error);
    return NextResponse.json({ error: "Failed to create checklist item" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.id) {
      return NextResponse.json({ error: "Checklist item ID required in body" }, { status: 400 });
    }

    const updates: any = {
      category: body.category !== undefined ? body.category : undefined,
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      required: body.required !== undefined ? body.required : undefined,
      completed: body.completed !== undefined ? body.completed : undefined,
      completedBy: body.completedBy !== undefined ? body.completedBy : undefined,
      completedAt: body.completedAt !== undefined ? body.completedAt : undefined,
      dueDate: body.dueDate !== undefined ? body.dueDate : undefined,
      order: body.order !== undefined ? body.order : undefined,
    };

    // Handle toggle special case
    if (body.toggle === true) {
      const toggleValue = !body.completed; // Toggle based on current value in body
      updates.completed = toggleValue;
      if (toggleValue) {
        // Toggling to true
        updates.completedBy = body.completedBy || "system";
        updates.completedAt = now;
      } else {
        // Toggling to false
        updates.completedBy = null;
        updates.completedAt = null;
      }
    }

    const updated = await db
      .update(schema.activationChecklists)
      .set(updates)
      .where(
        and(
          eq(schema.activationChecklists.id, body.id),
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Checklist item ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationChecklists)
      .where(
        and(
          eq(schema.activationChecklists.id, body.id),
          eq(schema.activationChecklists.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/checklists error:", error);
    return NextResponse.json({ error: "Failed to delete checklist item" }, { status: 500 });
  }
}
