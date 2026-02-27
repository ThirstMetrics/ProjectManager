import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    const budgetId = `budget-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newBudgetItem = await db
      .insert(schema.activationBudgetItems)
      .values({
        id: budgetId,
        activationId: id,
        category: body.category || "miscellaneous",
        description: body.description || "",
        vendor: body.vendor || "",
        estimatedAmount: body.estimatedAmount || 0,
        actualAmount: body.actualAmount || null,
        status: body.status || "estimated",
        approvedBy: body.approvedBy || null,
        approvedAt: body.approvedAt || null,
        receiptUrl: body.receiptUrl || "",
        notes: body.notes || "",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newBudgetItem[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/budget error:", error);
    return NextResponse.json({ error: "Failed to create budget item" }, { status: 500 });
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
      return NextResponse.json({ error: "Budget item ID required in body" }, { status: 400 });
    }

    const updates: any = {
      category: body.category !== undefined ? body.category : undefined,
      description: body.description !== undefined ? body.description : undefined,
      vendor: body.vendor !== undefined ? body.vendor : undefined,
      estimatedAmount: body.estimatedAmount !== undefined ? body.estimatedAmount : undefined,
      actualAmount: body.actualAmount !== undefined ? body.actualAmount : undefined,
      status: body.status !== undefined ? body.status : undefined,
      approvedBy: body.approvedBy !== undefined ? body.approvedBy : undefined,
      approvedAt: body.approvedAt !== undefined ? body.approvedAt : undefined,
      receiptUrl: body.receiptUrl !== undefined ? body.receiptUrl : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      updatedAt: now,
    };

    // Handle approve special case
    if (body.approve === true) {
      updates.status = "approved";
      updates.approvedBy = body.approvedBy || "system";
      updates.approvedAt = now;
    }

    // Handle reject special case
    if (body.reject === true) {
      updates.status = "rejected";
    }

    const updated = await db
      .update(schema.activationBudgetItems)
      .set(updates)
      .where(
        and(
          eq(schema.activationBudgetItems.id, body.id),
          eq(schema.activationBudgetItems.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Budget item not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/budget error:", error);
    return NextResponse.json({ error: "Failed to update budget item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Budget item ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationBudgetItems)
      .where(
        and(
          eq(schema.activationBudgetItems.id, body.id),
          eq(schema.activationBudgetItems.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/budget error:", error);
    return NextResponse.json({ error: "Failed to delete budget item" }, { status: 500 });
  }
}
