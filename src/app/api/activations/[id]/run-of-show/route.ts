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

    const rosId = `ros-${crypto.randomUUID().slice(0, 8)}`;

    const newRunOfShow = await db
      .insert(schema.activationRunOfShow)
      .values({
        id: rosId,
        activationId: id,
        time: body.time || "00:00",
        endTime: body.endTime || null,
        title: body.title || "New Run of Show Item",
        description: body.description || "",
        responsiblePersonnelId: body.responsiblePersonnelId || null,
        responsibleName: body.responsibleName || "",
        completed: body.completed || false,
        completedAt: body.completedAt || null,
        order: body.order || 0,
      })
      .returning();

    return NextResponse.json(newRunOfShow[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/run-of-show error:", error);
    return NextResponse.json({ error: "Failed to create run of show item" }, { status: 500 });
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
      return NextResponse.json({ error: "Run of Show item ID required in body" }, { status: 400 });
    }

    const updates: any = {
      time: body.time !== undefined ? body.time : undefined,
      endTime: body.endTime !== undefined ? body.endTime : undefined,
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      responsiblePersonnelId: body.responsiblePersonnelId !== undefined ? body.responsiblePersonnelId : undefined,
      responsibleName: body.responsibleName !== undefined ? body.responsibleName : undefined,
      completed: body.completed !== undefined ? body.completed : undefined,
      completedAt: body.completedAt !== undefined ? body.completedAt : undefined,
      order: body.order !== undefined ? body.order : undefined,
    };

    // Handle complete special case
    if (body.complete === true) {
      updates.completed = true;
      updates.completedAt = now;
    }

    const updated = await db
      .update(schema.activationRunOfShow)
      .set(updates)
      .where(
        and(
          eq(schema.activationRunOfShow.id, body.id),
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Run of Show item ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationRunOfShow)
      .where(
        and(
          eq(schema.activationRunOfShow.id, body.id),
          eq(schema.activationRunOfShow.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/run-of-show error:", error);
    return NextResponse.json({ error: "Failed to delete run of show item" }, { status: 500 });
  }
}
