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

    const productId = `prod-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newProduct = await db
      .insert(schema.activationProducts)
      .values({
        id: productId,
        activationId: id,
        name: body.name || "New Product",
        sku: body.sku || "",
        category: body.category || "",
        quantityRequested: body.quantityRequested || 0,
        quantityConfirmed: body.quantityConfirmed || 0,
        quantityShipped: body.quantityShipped || 0,
        quantityDelivered: body.quantityDelivered || 0,
        quantityUsed: body.quantityUsed || 0,
        quantityReturned: body.quantityReturned || 0,
        quantityDamaged: body.quantityDamaged || 0,
        unitCost: body.unitCost || 0,
        status: body.status || "requested",
        shippingTrackingNumber: body.shippingTrackingNumber || "",
        shippingCarrier: body.shippingCarrier || "",
        expectedDeliveryDate: body.expectedDeliveryDate || null,
        deliveredAt: body.deliveredAt || null,
        reconciledAt: null,
        reconciledBy: null,
        notes: body.notes || "",
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.id) {
      return NextResponse.json({ error: "Product ID required in body" }, { status: 400 });
    }

    const updates: any = {
      name: body.name !== undefined ? body.name : undefined,
      sku: body.sku !== undefined ? body.sku : undefined,
      category: body.category !== undefined ? body.category : undefined,
      quantityRequested: body.quantityRequested !== undefined ? body.quantityRequested : undefined,
      quantityConfirmed: body.quantityConfirmed !== undefined ? body.quantityConfirmed : undefined,
      quantityShipped: body.quantityShipped !== undefined ? body.quantityShipped : undefined,
      quantityDelivered: body.quantityDelivered !== undefined ? body.quantityDelivered : undefined,
      quantityUsed: body.quantityUsed !== undefined ? body.quantityUsed : undefined,
      quantityReturned: body.quantityReturned !== undefined ? body.quantityReturned : undefined,
      quantityDamaged: body.quantityDamaged !== undefined ? body.quantityDamaged : undefined,
      unitCost: body.unitCost !== undefined ? body.unitCost : undefined,
      status: body.status !== undefined ? body.status : undefined,
      shippingTrackingNumber: body.shippingTrackingNumber !== undefined ? body.shippingTrackingNumber : undefined,
      shippingCarrier: body.shippingCarrier !== undefined ? body.shippingCarrier : undefined,
      expectedDeliveryDate: body.expectedDeliveryDate !== undefined ? body.expectedDeliveryDate : undefined,
      deliveredAt: body.deliveredAt !== undefined ? body.deliveredAt : undefined,
      notes: body.notes !== undefined ? body.notes : undefined,
      updatedAt: now,
    };

    // Handle reconcile special case
    if (body.reconcile === true) {
      updates.quantityUsed = body.quantityUsed !== undefined ? body.quantityUsed : 0;
      updates.quantityReturned = body.quantityReturned !== undefined ? body.quantityReturned : 0;
      updates.quantityDamaged = body.quantityDamaged !== undefined ? body.quantityDamaged : 0;
      updates.reconciledBy = body.reconciledBy || "system";
      updates.reconciledAt = now;
      updates.status = "reconciled";
    }

    const updated = await db
      .update(schema.activationProducts)
      .set(updates)
      .where(
        and(
          eq(schema.activationProducts.id, body.id),
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Product ID required in body" }, { status: 400 });
    }

    await db
      .delete(schema.activationProducts)
      .where(
        and(
          eq(schema.activationProducts.id, body.id),
          eq(schema.activationProducts.activationId, id)
        )
      );

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id]/products error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
