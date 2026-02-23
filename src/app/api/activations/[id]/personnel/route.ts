import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const personnelId = `pers-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newPersonnel = await db
      .insert(schema.activationPersonnel)
      .values({
        id: personnelId,
        activationId: id,
        stakeholderId: body.stakeholderId || null,
        name: body.name || "New Personnel",
        email: body.email || "",
        phone: body.phone || "",
        role: body.role || "",
        clockStatus: body.clockStatus || "not_started",
        clockInTime: body.clockInTime || null,
        clockOutTime: body.clockOutTime || null,
        breakStartTime: body.breakStartTime || null,
        totalHoursWorked: body.totalHoursWorked || null,
        hourlyRate: body.hourlyRate || 0,
        productKnowledgeVerified: body.productKnowledgeVerified || false,
        productKnowledgeVerifiedAt: body.productKnowledgeVerifiedAt || null,
        productKnowledgeScore: body.productKnowledgeScore || null,
        notes: body.notes || "",
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Personnel ID required in body" }, { status: 400 });
    }

    const updates: any = {
      stakeholderId: body.stakeholderId !== undefined ? body.stakeholderId : undefined,
      name: body.name !== undefined ? body.name : undefined,
      email: body.email !== undefined ? body.email : undefined,
      phone: body.phone !== undefined ? body.phone : undefined,
      role: body.role !== undefined ? body.role : undefined,
      clockStatus: body.clockStatus !== undefined ? body.clockStatus : undefined,
      clockInTime: body.clockInTime !== undefined ? body.clockInTime : undefined,
      clockOutTime: body.clockOutTime !== undefined ? body.clockOutTime : undefined,
      breakStartTime: body.breakStartTime !== undefined ? body.breakStartTime : undefined,
      totalHoursWorked: body.totalHoursWorked !== undefined ? body.totalHoursWorked : undefined,
      hourlyRate: body.hourlyRate !== undefined ? body.hourlyRate : undefined,
      productKnowledgeVerified: body.productKnowledgeVerified !== undefined ? body.productKnowledgeVerified : undefined,
      productKnowledgeVerifiedAt: body.productKnowledgeVerifiedAt !== undefined ? body.productKnowledgeVerifiedAt : undefined,
      productKnowledgeScore: body.productKnowledgeScore !== undefined ? body.productKnowledgeScore : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
    };

    const updated = await db
      .update(schema.activationPersonnel)
      .set(updates)
      .where(
        and(
          eq(schema.activationPersonnel.id, body.id),
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Personnel ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationPersonnel)
      .where(
        and(
          eq(schema.activationPersonnel.id, body.id),
          eq(schema.activationPersonnel.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/personnel error:", error);
    return NextResponse.json({ error: "Failed to delete personnel" }, { status: 500 });
  }
}
