import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const docId = `doc-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newDocument = await db
      .insert(schema.activationDocuments)
      .values({
        id: docId,
        activationId: id,
        type: body.type || "other",
        title: body.title || "New Document",
        content: body.content || "",
        fileName: body.fileName || "",
        fileUrl: body.fileUrl || "",
        fileSize: body.fileSize || 0,
        scopedToStakeholderId: body.scopedToStakeholderId || null,
        visibleToStakeholderIds: body.visibleToStakeholderIds || [],
        signStatus: body.signStatus || "draft",
        signedBy: body.signedBy || null,
        signedAt: body.signedAt || null,
        signatureData: body.signatureData || null,
        signerName: body.signerName || null,
        signerEmail: body.signerEmail || null,
        expiresAt: body.expiresAt || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newDocument[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/documents error:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.id) {
      return NextResponse.json({ error: "Document ID required in body" }, { status: 400 });
    }

    const updates: any = {
      type: body.type !== undefined ? body.type : undefined,
      title: body.title !== undefined ? body.title : undefined,
      content: body.content !== undefined ? body.content : undefined,
      fileName: body.fileName !== undefined ? body.fileName : undefined,
      fileUrl: body.fileUrl !== undefined ? body.fileUrl : undefined,
      fileSize: body.fileSize !== undefined ? body.fileSize : undefined,
      scopedToStakeholderId: body.scopedToStakeholderId !== undefined ? body.scopedToStakeholderId : undefined,
      visibleToStakeholderIds: body.visibleToStakeholderIds !== undefined ? body.visibleToStakeholderIds : undefined,
      signStatus: body.signStatus !== undefined ? body.signStatus : undefined,
      signedBy: body.signedBy !== undefined ? body.signedBy : undefined,
      signedAt: body.signedAt !== undefined ? body.signedAt : undefined,
      signatureData: body.signatureData !== undefined ? body.signatureData : undefined,
      signerName: body.signerName !== undefined ? body.signerName : undefined,
      signerEmail: body.signerEmail !== undefined ? body.signerEmail : undefined,
      expiresAt: body.expiresAt !== undefined ? body.expiresAt : undefined,
      updatedAt: now,
    };

    // Handle sign special case
    if (body.sign === true) {
      updates.signStatus = "signed";
      updates.signedBy = body.signedBy || "system";
      updates.signedAt = now;
      updates.signatureData = body.signatureData || null;
      updates.signerName = body.signerName || null;
      updates.signerEmail = body.signerEmail || null;
    }

    const updated = await db
      .update(schema.activationDocuments)
      .set(updates)
      .where(
        and(
          eq(schema.activationDocuments.id, body.id),
          eq(schema.activationDocuments.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/documents error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Document ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationDocuments)
      .where(
        and(
          eq(schema.activationDocuments.id, body.id),
          eq(schema.activationDocuments.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/documents error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
