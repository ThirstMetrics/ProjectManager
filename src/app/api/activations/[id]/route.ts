import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;

    const activation = await db
      .select()
      .from(schema.activations)
      .where(eq(schema.activations.id, id));

    if (!activation || activation.length === 0) {
      return NextResponse.json({ error: "Activation not found" }, { status: 404 });
    }

    return NextResponse.json(activation[0]);
  } catch (error) {
    console.error("GET /api/activations/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch activation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.activations)
      .set({
        name: body.name !== undefined ? body.name : undefined,
        brand: body.brand !== undefined ? body.brand : undefined,
        description: body.description !== undefined ? body.description : undefined,
        color: body.color !== undefined ? body.color : undefined,
        icon: body.icon !== undefined ? body.icon : undefined,
        phase: body.phase !== undefined ? body.phase : undefined,
        status: body.status !== undefined ? body.status : undefined,
        eventDate: body.eventDate !== undefined ? body.eventDate : undefined,
        eventEndDate: body.eventEndDate !== undefined ? body.eventEndDate : undefined,
        setupDate: body.setupDate !== undefined ? body.setupDate : undefined,
        teardownDate: body.teardownDate !== undefined ? body.teardownDate : undefined,
        venueId: body.venueId !== undefined ? body.venueId : undefined,
        budgetTotal: body.budgetTotal !== undefined ? body.budgetTotal : undefined,
        budgetSpent: body.budgetSpent !== undefined ? body.budgetSpent : undefined,
        leadGoal: body.leadGoal !== undefined ? body.leadGoal : undefined,
        sampleGoal: body.sampleGoal !== undefined ? body.sampleGoal : undefined,
        interactionGoal: body.interactionGoal !== undefined ? body.interactionGoal : undefined,
        tags: body.tags !== undefined ? body.tags : undefined,
        updatedAt: now,
      })
      .where(eq(schema.activations.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Activation not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id] error:", error);
    return NextResponse.json({ error: "Failed to update activation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;

    await db.delete(schema.activations).where(eq(schema.activations.id, id));

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete activation" }, { status: 500 });
  }
}
