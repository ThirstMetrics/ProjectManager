import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const stakeholderId = `stk-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newStakeholder = await db
      .insert(schema.activationStakeholders)
      .values({
        id: stakeholderId,
        activationId: id,
        name: body.name || "New Stakeholder",
        email: body.email || "",
        phone: body.phone || "",
        company: body.company || "",
        type: body.type || "other",
        role: body.role || "",
        avatar: body.avatar || null,
        ndaStatus: body.ndaStatus || "not_required",
        ndaDocumentId: body.ndaDocumentId || null,
        canViewBudget: body.canViewBudget || false,
        canViewLeads: body.canViewLeads || false,
        canViewAllDocuments: body.canViewAllDocuments || false,
        notes: body.notes || "",
        invitedAt: now,
        status: body.status || "invited",
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Stakeholder ID required in body" }, { status: 400 });
    }

    const updated = await db
      .update(schema.activationStakeholders)
      .set({
        name: body.name !== undefined ? body.name : undefined,
        email: body.email !== undefined ? body.email : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        company: body.company !== undefined ? body.company : undefined,
        type: body.type !== undefined ? body.type : undefined,
        role: body.role !== undefined ? body.role : undefined,
        avatar: body.avatar !== undefined ? body.avatar : undefined,
        ndaStatus: body.ndaStatus !== undefined ? body.ndaStatus : undefined,
        ndaDocumentId: body.ndaDocumentId !== undefined ? body.ndaDocumentId : undefined,
        canViewBudget: body.canViewBudget !== undefined ? body.canViewBudget : undefined,
        canViewLeads: body.canViewLeads !== undefined ? body.canViewLeads : undefined,
        canViewAllDocuments: body.canViewAllDocuments !== undefined ? body.canViewAllDocuments : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        status: body.status !== undefined ? body.status : undefined,
      })
      .where(
        and(
          eq(schema.activationStakeholders.id, body.id),
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Stakeholder ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationStakeholders)
      .where(
        and(
          eq(schema.activationStakeholders.id, body.id),
          eq(schema.activationStakeholders.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/stakeholders error:", error);
    return NextResponse.json({ error: "Failed to delete stakeholder" }, { status: 500 });
  }
}
