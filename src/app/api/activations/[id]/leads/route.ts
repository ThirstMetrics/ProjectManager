import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const leadId = `lead-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newLead = await db
      .insert(schema.activationLeads)
      .values({
        id: leadId,
        activationId: id,
        capturedBy: body.capturedBy || "system",
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        email: body.email || "",
        phone: body.phone || "",
        instagramHandle: body.instagramHandle || "",
        xHandle: body.xHandle || "",
        source: body.source || "walk_in",
        consentGiven: body.consentGiven || false,
        consentTimestamp: body.consentTimestamp || null,
        consentText: body.consentText || "",
        notes: body.notes || "",
        tags: body.tags || [],
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Lead ID required in body" }, { status: 400 });
    }

    const updated = await db
      .update(schema.activationLeads)
      .set({
        capturedBy: body.capturedBy !== undefined ? body.capturedBy : undefined,
        firstName: body.firstName !== undefined ? body.firstName : undefined,
        lastName: body.lastName !== undefined ? body.lastName : undefined,
        email: body.email !== undefined ? body.email : undefined,
        phone: body.phone !== undefined ? body.phone : undefined,
        instagramHandle: body.instagramHandle !== undefined ? body.instagramHandle : undefined,
        xHandle: body.xHandle !== undefined ? body.xHandle : undefined,
        source: body.source !== undefined ? body.source : undefined,
        consentGiven: body.consentGiven !== undefined ? body.consentGiven : undefined,
        consentTimestamp: body.consentTimestamp !== undefined ? body.consentTimestamp : undefined,
        consentText: body.consentText !== undefined ? body.consentText : undefined,
        notes: body.notes !== undefined ? body.notes : undefined,
        tags: body.tags !== undefined ? body.tags : undefined,
      })
      .where(
        and(
          eq(schema.activationLeads.id, body.id),
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Lead ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationLeads)
      .where(
        and(
          eq(schema.activationLeads.id, body.id),
          eq(schema.activationLeads.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/leads error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
