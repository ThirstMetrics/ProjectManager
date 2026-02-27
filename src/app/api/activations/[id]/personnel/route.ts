import { NextRequest, NextResponse } from "next/server";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, personnelCreateSchema, personnelUpdateSchema, activationDeleteSchema } from "@/lib/validation";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, personnelCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const personnelId = `pers-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newPersonnel = await db
      .insert(schema.activationPersonnel)
      .values({
        id: personnelId,
        activationId: id,
        stakeholderId: data.stakeholderId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        clockStatus: data.clockStatus,
        clockInTime: data.clockInTime,
        clockOutTime: data.clockOutTime,
        breakStartTime: data.breakStartTime,
        totalHoursWorked: data.totalHoursWorked,
        hourlyRate: data.hourlyRate,
        productKnowledgeVerified: data.productKnowledgeVerified,
        productKnowledgeVerifiedAt: data.productKnowledgeVerifiedAt,
        productKnowledgeScore: data.productKnowledgeScore,
        notes: data.notes,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newPersonnel[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/personnel error:", error);
    return NextResponse.json({ error: "Failed to create personnel" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, personnelUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const updated = await db
      .update(schema.activationPersonnel)
      .set(data)
      .where(
        and(
          eq(schema.activationPersonnel.id, data.id),
          eq(schema.activationPersonnel.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Personnel not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/personnel error:", error);
    return NextResponse.json({ error: "Failed to update personnel" }, { status: 500 });
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
      .delete(schema.activationPersonnel)
      .where(
        and(
          eq(schema.activationPersonnel.id, data.id),
          eq(schema.activationPersonnel.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/personnel error:", error);
    return NextResponse.json({ error: "Failed to delete personnel" }, { status: 500 });
  }
}
