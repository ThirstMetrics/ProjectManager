import { NextRequest, NextResponse } from "next/server";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, productCreateSchema, productUpdateSchema, activationDeleteSchema } from "@/lib/validation";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, productCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const productId = `prod-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newProduct = await db
      .insert(schema.activationProducts)
      .values({
        id: productId,
        activationId: id,
        name: data.name,
        sku: data.sku,
        category: data.category,
        quantityRequested: data.quantityRequested,
        quantityConfirmed: data.quantityConfirmed,
        quantityShipped: data.quantityShipped,
        quantityDelivered: data.quantityDelivered,
        quantityUsed: data.quantityUsed,
        quantityReturned: data.quantityReturned,
        quantityDamaged: data.quantityDamaged,
        unitCost: data.unitCost,
        status: data.status,
        shippingTrackingNumber: data.shippingTrackingNumber,
        shippingCarrier: data.shippingCarrier,
        expectedDeliveryDate: data.expectedDeliveryDate,
        deliveredAt: data.deliveredAt,
        reconciledAt: null,
        reconciledBy: null,
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, productUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    const updates: any = {
      ...data,
      updatedAt: now,
    };

    // Handle reconcile special case
    if (data.reconcile === true) {
      updates.quantityUsed = data.quantityUsed !== undefined ? data.quantityUsed : 0;
      updates.quantityReturned = data.quantityReturned !== undefined ? data.quantityReturned : 0;
      updates.quantityDamaged = data.quantityDamaged !== undefined ? data.quantityDamaged : 0;
      updates.reconciledBy = data.reconciledBy || "system";
      updates.reconciledAt = now;
      updates.status = "reconciled";
    }

    const updated = await db
      .update(schema.activationProducts)
      .set(updates)
      .where(
        and(
          eq(schema.activationProducts.id, data.id),
          eq(schema.activationProducts.activationId, id)
        )
      )
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id]/products error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
      .delete(schema.activationProducts)
      .where(
        and(
          eq(schema.activationProducts.id, data.id),
          eq(schema.activationProducts.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/products error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
