import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireActivationAccess } from "@/lib/rbac";
import { validateBody, activationUpdateSchema } from "@/lib/validation";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;
  try {
    const activation = await db
      .select()
      .from(schema.activations)
      .where(eq(schema.activations.id, id));

    if (!activation || activation.length === 0) {
      return NextResponse.json({ error: "Activation not found" }, { status: 404 });
    }

    return NextResponse.json(activation[0]);
  } catch (error) {
    console.error("GET /api/activations/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch activation" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;

  const data = await validateBody(req, activationUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.activations)
      .set({ ...data, updatedAt: now })
      .where(eq(schema.activations.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Activation not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("PATCH /api/activations/[id] error:", error);
    return NextResponse.json({ error: "Failed to update activation" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireActivationAccess(id);
  if (result instanceof NextResponse) return result;
  const [, access] = result;

  // Only creator or admin can delete
  if (access.role === "stakeholder") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    await db.delete(schema.activations).where(eq(schema.activations.id, id));
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/activations/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete activation" }, { status: 500 });
  }
}
