import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    const venueId = `venue-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newVenue = await db
      .insert(schema.activationVenues)
      .values({
        id: venueId,
        activationId: id,
        name: body.name || "New Venue",
        address: body.address || "",
        city: body.city || "",
        state: body.state || "",
        zip: body.zip || "",
        contactName: body.contactName || "",
        contactEmail: body.contactEmail || "",
        contactPhone: body.contactPhone || "",
        venueType: body.venueType || "",
        capacity: body.capacity || 0,
        status: body.status || "identified",
        walkthroughDate: body.walkthroughDate || null,
        walkthroughNotes: body.walkthroughNotes || "",
        bookingConfirmedAt: body.bookingConfirmedAt || null,
        bookingCost: body.bookingCost || 0,
        specialRequirements: body.specialRequirements || "",
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.id) {
      return NextResponse.json({ error: "Venue ID required in body" }, { status: 400 });
    }

    const updated = await db
      .update(schema.activationVenues)
      .set({
        name: body.name !== undefined ? body.name : undefined,
        address: body.address !== undefined ? body.address : undefined,
        city: body.city !== undefined ? body.city : undefined,
        state: body.state !== undefined ? body.state : undefined,
        zip: body.zip !== undefined ? body.zip : undefined,
        contactName: body.contactName !== undefined ? body.contactName : undefined,
        contactEmail: body.contactEmail !== undefined ? body.contactEmail : undefined,
        contactPhone: body.contactPhone !== undefined ? body.contactPhone : undefined,
        venueType: body.venueType !== undefined ? body.venueType : undefined,
        capacity: body.capacity !== undefined ? body.capacity : undefined,
        status: body.status !== undefined ? body.status : undefined,
        walkthroughDate: body.walkthroughDate !== undefined ? body.walkthroughDate : undefined,
        walkthroughNotes: body.walkthroughNotes !== undefined ? body.walkthroughNotes : undefined,
        bookingConfirmedAt: body.bookingConfirmedAt !== undefined ? body.bookingConfirmedAt : undefined,
        bookingCost: body.bookingCost !== undefined ? body.bookingCost : undefined,
        specialRequirements: body.specialRequirements !== undefined ? body.specialRequirements : undefined,
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.activationVenues.id, body.id),
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Venue ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationVenues)
      .where(
        and(
          eq(schema.activationVenues.id, body.id),
          eq(schema.activationVenues.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/venues error:", error);
    return NextResponse.json({ error: "Failed to delete venue" }, { status: 500 });
  }
}
