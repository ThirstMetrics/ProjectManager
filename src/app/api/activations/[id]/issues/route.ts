import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const issueId = `issue-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newIssue = await db
      .insert(schema.activationIssues)
      .values({
        id: issueId,
        activationId: id,
        reportedBy: body.reportedBy || "system",
        reportedByPersonnelId: body.reportedByPersonnelId || null,
        category: body.category || "other",
        severity: body.severity || "medium",
        status: body.status || "open",
        title: body.title || "New Issue",
        description: body.description || "",
        resolution: body.resolution || "",
        resolvedBy: body.resolvedBy || null,
        resolvedAt: body.resolvedAt || null,
        escalatedTo: body.escalatedTo || null,
        photos: body.photos || [],
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
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.id) {
      return NextResponse.json({ error: "Issue ID required in body" }, { status: 400 });
    }

    const updates: any = {
      reportedBy: body.reportedBy !== undefined ? body.reportedBy : undefined,
      reportedByPersonnelId: body.reportedByPersonnelId !== undefined ? body.reportedByPersonnelId : undefined,
      category: body.category !== undefined ? body.category : undefined,
      severity: body.severity !== undefined ? body.severity : undefined,
      status: body.status !== undefined ? body.status : undefined,
      title: body.title !== undefined ? body.title : undefined,
      description: body.description !== undefined ? body.description : undefined,
      resolution: body.resolution !== undefined ? body.resolution : undefined,
      resolvedBy: body.resolvedBy !== undefined ? body.resolvedBy : undefined,
      resolvedAt: body.resolvedAt !== undefined ? body.resolvedAt : undefined,
      escalatedTo: body.escalatedTo !== undefined ? body.escalatedTo : undefined,
      photos: body.photos !== undefined ? body.photos : undefined,
      updatedAt: now,
    };

    // Handle escalate special case
    if (body.escalate === true) {
      updates.status = "escalated";
      updates.escalatedTo = body.escalatedTo || "management";
    }

    // Handle resolve special case
    if (body.resolve === true) {
      updates.status = "resolved";
      updates.resolution = body.resolution || "";
      updates.resolvedBy = body.resolvedBy || "system";
      updates.resolvedAt = now;
    }

    const updated = await db
      .update(schema.activationIssues)
      .set(updates)
      .where(
        and(
          eq(schema.activationIssues.id, body.id),
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
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Issue ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationIssues)
      .where(
        and(
          eq(schema.activationIssues.id, body.id),
          eq(schema.activationIssues.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/issues error:", error);
    return NextResponse.json({ error: "Failed to delete issue" }, { status: 500 });
  }
}
