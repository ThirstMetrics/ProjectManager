import { NextRequest, NextResponse } from "next/server";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, leadCreateSchema, leadUpdateSchema, activationDeleteSchema } from "@/lib/validation";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id, { requireLeadAccess: true });
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, leadCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const leadId = `lead-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newLead = await db
      .insert(schema.activationLeads)
      .values({
        id: leadId,
        activationId: id,
        capturedBy: data.capturedBy,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        instagramHandle: data.instagramHandle,
        xHandle: data.xHandle,
        source: data.source,
        consentGiven: data.consentGiven,
        consentTimestamp: data.consentTimestamp,
        consentText: data.consentText,
        notes: data.notes,
        tags: data.tags,
        capturedAt: now,
      })
      .returning();

    return NextResponse.json(newLead[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/leads error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id, { requireLeadAccess: true });
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, leadUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const updated = await db
      .update(schema.activationLeads)
      .set(data)
      .where(
        and(
          eq(schema.activationLeads.id, data.id),
          eq(schema.activationLeads.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/leads error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id, { requireLeadAccess: true });
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, activationDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.activationLeads)
      .where(
        and(
          eq(schema.activationLeads.id, data.id),
          eq(schema.activationLeads.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/leads error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
