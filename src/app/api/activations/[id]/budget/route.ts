import { NextRequest, NextResponse } from "next/server";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, budgetItemCreateSchema, budgetItemUpdateSchema, activationDeleteSchema } from "@/lib/validation";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id, { requireBudgetAccess: true });
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, budgetItemCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const budgetId = `budget-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newBudgetItem = await db
      .insert(schema.activationBudgetItems)
      .values({
        id: budgetId,
        activationId: id,
        category: data.category,
        description: data.description,
        vendor: data.vendor,
        estimatedAmount: data.estimatedAmount,
        actualAmount: data.actualAmount,
        status: data.status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
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
  const { id } = await params;
  const result = await requireActivationAccess(id, { requireBudgetAccess: true });
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, budgetItemUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    const updates: any = {
      ...data,
      updatedAt: now,
    };

    // Handle approve special case
    if (data.approve === true) {
      updates.status = "approved";
      updates.approvedBy = data.approvedBy || "system";
      updates.approvedAt = now;
    }

    // Handle reject special case
    if (data.reject === true) {
      updates.status = "rejected";
    }

    const updated = await db
      .update(schema.activationBudgetItems)
      .set(updates)
      .where(
        and(
          eq(schema.activationBudgetItems.id, data.id),
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
  const { id } = await params;
  const result = await requireActivationAccess(id, { requireBudgetAccess: true });
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, activationDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.activationBudgetItems)
      .where(
        and(
          eq(schema.activationBudgetItems.id, data.id),
          eq(schema.activationBudgetItems.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/budget error:", error);
    return NextResponse.json({ error: "Failed to delete budget item" }, { status: 500 });
  }
}
