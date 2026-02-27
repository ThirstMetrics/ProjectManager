import { NextRequest, NextResponse } from "next/server";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, venueCreateSchema, venueUpdateSchema, activationDeleteSchema } from "@/lib/validation";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, venueCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const venueId = `venue-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newVenue = await db
      .insert(schema.activationVenues)
      .values({
        id: venueId,
        activationId: id,
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        venueType: data.venueType,
        capacity: data.capacity,
        status: data.status,
        walkthroughDate: data.walkthroughDate,
        walkthroughNotes: data.walkthroughNotes,
        bookingConfirmedAt: data.bookingConfirmedAt,
        bookingCost: data.bookingCost,
        specialRequirements: data.specialRequirements,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newVenue[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/venues error:", error);
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, venueUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.activationVenues)
      .set({
        ...data,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.activationVenues.id, data.id),
          eq(schema.activationVenues.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/venues error:", error);
    return NextResponse.json({ error: "Failed to update venue" }, { status: 500 });
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
      .delete(schema.activationVenues)
      .where(
        and(
          eq(schema.activationVenues.id, data.id),
          eq(schema.activationVenues.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/venues error:", error);
    return NextResponse.json({ error: "Failed to delete venue" }, { status: 500 });
  }
}
