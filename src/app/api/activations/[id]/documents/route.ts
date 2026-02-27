import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, documentCreateSchema, documentUpdateSchema, activationDeleteSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, documentCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const docId = `doc-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newDocument = await db
      .insert(schema.activationDocuments)
      .values({
        id: docId,
        activationId: id,
        type: data.type || "other",
        title: data.title || "New Document",
        content: data.content || "",
        fileName: data.fileName || "",
        fileUrl: data.fileUrl || "",
        fileSize: data.fileSize || 0,
        scopedToStakeholderId: data.scopedToStakeholderId || null,
        visibleToStakeholderIds: data.visibleToStakeholderIds || [],
        signStatus: data.signStatus || "draft",
        signedBy: data.signedBy || null,
        signedAt: data.signedAt || null,
        signatureData: data.signatureData || null,
        signerName: data.signerName || null,
        signerEmail: data.signerEmail || null,
        expiresAt: data.expiresAt || null,
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
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, documentUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    // Handle sign special case
    if (data.sign === true) {
      const updates = {
        ...data,
        signStatus: "signed" as const,
        signedBy: data.signedBy || "system",
        signedAt: now,
        signatureData: data.signatureData || null,
        signerName: data.signerName || null,
        signerEmail: data.signerEmail || null,
        updatedAt: now,
      };
      // Remove control flag before sending to DB
      const { sign, ...dbUpdates } = updates;

      const updated = await db
        .update(schema.activationDocuments)
        .set(dbUpdates)
        .where(
          and(
            eq(schema.activationDocuments.id, data.id),
            eq(schema.activationDocuments.activationId, id)
          )
        )
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    }

    // Normal update path
    const { sign, ...updates } = { ...data, updatedAt: now };

    const updated = await db
      .update(schema.activationDocuments)
      .set(updates)
      .where(
        and(
          eq(schema.activationDocuments.id, data.id),
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
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, activationDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.activationDocuments)
      .where(
        and(
          eq(schema.activationDocuments.id, data.id),
          eq(schema.activationDocuments.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/documents error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
