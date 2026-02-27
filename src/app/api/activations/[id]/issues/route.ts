import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, issueCreateSchema, issueUpdateSchema, activationDeleteSchema } from "@/lib/validation";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, issueCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const issueId = `issue-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newIssue = await db
      .insert(schema.activationIssues)
      .values({
        id: issueId,
        activationId: id,
        reportedBy: data.reportedBy || "system",
        reportedByPersonnelId: data.reportedByPersonnelId || null,
        category: data.category || "other",
        severity: data.severity || "medium",
        status: data.status || "open",
        title: data.title || "New Issue",
        description: data.description || "",
        resolution: data.resolution || "",
        resolvedBy: data.resolvedBy || null,
        resolvedAt: data.resolvedAt || null,
        escalatedTo: data.escalatedTo || null,
        photos: data.photos || [],
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newIssue[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/issues error:", error);
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, issueUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    // Handle escalate special case
    if (data.escalate === true) {
      const updates = {
        ...data,
        status: "escalated" as const,
        escalatedTo: data.escalatedTo || "management",
        updatedAt: now,
      };
      // Remove control flags before sending to DB
      const { escalate, resolve, ...dbUpdates } = updates;

      const updated = await db
        .update(schema.activationIssues)
        .set(dbUpdates)
        .where(
          and(
            eq(schema.activationIssues.id, data.id),
            eq(schema.activationIssues.activationId, id)
          )
        )
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    }

    // Handle resolve special case
    if (data.resolve === true) {
      const updates = {
        ...data,
        status: "resolved" as const,
        resolution: data.resolution || "",
        resolvedBy: data.resolvedBy || "system",
        resolvedAt: now,
        updatedAt: now,
      };
      // Remove control flags before sending to DB
      const { escalate, resolve, ...dbUpdates } = updates;

      const updated = await db
        .update(schema.activationIssues)
        .set(dbUpdates)
        .where(
          and(
            eq(schema.activationIssues.id, data.id),
            eq(schema.activationIssues.activationId, id)
          )
        )
        .returning();

      if (!updated || updated.length === 0) {
        return NextResponse.json({ error: "Issue not found" }, { status: 404 });
      }

      return NextResponse.json(updated[0]);
    }

    // Normal update path
    const { escalate, resolve, ...updates } = { ...data, updatedAt: now };

    const updated = await db
      .update(schema.activationIssues)
      .set(updates)
      .where(
        and(
          eq(schema.activationIssues.id, data.id),
          eq(schema.activationIssues.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/issues error:", error);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
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
      .delete(schema.activationIssues)
      .where(
        and(
          eq(schema.activationIssues.id, data.id),
          eq(schema.activationIssues.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/issues error:", error);
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 });
  }
}
