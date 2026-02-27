import { NextRequest, NextResponse } from "next/server";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, stakeholderCreateSchema, stakeholderUpdateSchema, activationDeleteSchema } from "@/lib/validation";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, stakeholderCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const stakeholderId = `stk-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newStakeholder = await db
      .insert(schema.activationStakeholders)
      .values({
        id: stakeholderId,
        activationId: id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        type: data.type,
        role: data.role,
        avatar: data.avatar,
        ndaStatus: data.ndaStatus,
        ndaDocumentId: data.ndaDocumentId,
        canViewBudget: data.canViewBudget,
        canViewLeads: data.canViewLeads,
        canViewAllDocuments: data.canViewAllDocuments,
        notes: data.notes,
        invitedAt: now,
        status: data.status,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newStakeholder[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/stakeholders error:", error);
    return NextResponse.json({ error: "Failed to create stakeholder" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, stakeholderUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const updated = await db
      .update(schema.activationStakeholders)
      .set(data)
      .where(
        and(
          eq(schema.activationStakeholders.id, data.id),
          eq(schema.activationStakeholders.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Stakeholder not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/stakeholders error:", error);
    return NextResponse.json({ error: "Failed to update stakeholder" }, { status: 500 });
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
      .delete(schema.activationStakeholders)
      .where(
        and(
          eq(schema.activationStakeholders.id, data.id),
          eq(schema.activationStakeholders.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/stakeholders error:", error);
    return NextResponse.json({ error: "Failed to delete stakeholder" }, { status: 500 });
  }
}
