import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, mediaCreateSchema, mediaUpdateSchema, activationDeleteSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, mediaCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const mediaId = `media-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newMedia = await db
      .insert(schema.activationMedia)
      .values({
        id: mediaId,
        activationId: id,
        type: data.type || "photo",
        url: data.url || "",
        thumbnailUrl: data.thumbnailUrl || "",
        caption: data.caption || "",
        takenBy: data.takenBy || "",
        takenAt: data.takenAt || now,
        tags: data.tags || [],
        approved: data.approved || false,
        approvedBy: data.approvedBy || "",
        fileSize: data.fileSize || 0,
      })
      .returning();

    return NextResponse.json(newMedia[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/media error:", error);
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, mediaUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    // Handle approve special case
    if (data.approve === true) {
      const updates = {
        ...data,
        approved: true,
        approvedBy: data.approvedBy || "system",
      };
      // Remove control flag before sending to DB
      const { approve, ...dbUpdates } = updates;

      const updated = await db
        .update(schema.activationMedia)
        .set(dbUpdates)
        .where(
          and(
            eq(schema.activationMedia.id, data.id),
            eq(schema.activationMedia.activationId, id)
          )
        )
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    }

    // Normal update path
    const { approve, ...updates } = data;

    const updated = await db
      .update(schema.activationMedia)
      .set(updates)
      .where(
        and(
          eq(schema.activationMedia.id, data.id),
          eq(schema.activationMedia.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/media error:", error);
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 });
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
      .delete(schema.activationMedia)
      .where(
        and(
          eq(schema.activationMedia.id, data.id),
          eq(schema.activationMedia.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/media error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
