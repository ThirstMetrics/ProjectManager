import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const mediaId = `media-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newMedia = await db
      .insert(schema.activationMedia)
      .values({
        id: mediaId,
        activationId: id,
        type: body.type || "photo",
        url: body.url || "",
        thumbnailUrl: body.thumbnailUrl || "",
        caption: body.caption || "",
        takenBy: body.takenBy || "",
        takenAt: body.takenAt || now,
        tags: body.tags || [],
        approved: body.approved || false,
        approvedBy: body.approvedBy || null,
        fileSize: body.fileSize || 0,
      })
      .returning();

    return NextResponse.json(newMedia[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/media error:", error);
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Media ID required in body" }, { status: 400 });
    }

    const updates: any = {
      type: body.type !== undefined ? body.type : undefined,
      url: body.url !== undefined ? body.url : undefined,
      thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl : undefined,
      caption: body.caption !== undefined ? body.caption : undefined,
      takenBy: body.takenBy !== undefined ? body.takenBy : undefined,
      takenAt: body.takenAt !== undefined ? body.takenAt : undefined,
      tags: body.tags !== undefined ? body.tags : undefined,
      approved: body.approved !== undefined ? body.approved : undefined,
      approvedBy: body.approvedBy !== undefined ? body.approvedBy : undefined,
      fileSize: body.fileSize !== undefined ? body.fileSize : undefined,
    };

    // Handle approve special case
    if (body.approve === true) {
      updates.approved = true;
      updates.approvedBy = body.approvedBy || "system";
    }

    const updated = await db
      .update(schema.activationMedia)
      .set(updates)
      .where(
        and(
          eq(schema.activationMedia.id, body.id),
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Media ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationMedia)
      .where(
        and(
          eq(schema.activationMedia.id, body.id),
          eq(schema.activationMedia.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/media error:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
