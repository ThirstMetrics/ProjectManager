import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { requireRole } from "@/lib/rbac";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { validateBody, activationCreateSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const activations = await db.select().from(schema.activations);
    return NextResponse.json(activations);
  } catch (error) {
    console.error("GET /api/activations error:", error);
    return NextResponse.json({ error: "Failed to fetch activations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireRole("member");
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, activationCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `act-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newActivation = await db
      .insert(schema.activations)
      .values({
        id,
        name: data.name,
        brand: data.brand,
        description: data.description,
        color: data.color,
        icon: data.icon,
        phase: data.phase,
        status: data.status,
        eventDate: data.eventDate || now,
        eventEndDate: data.eventEndDate,
        setupDate: data.setupDate,
        teardownDate: data.teardownDate,
        venueId: data.venueId,
        budgetTotal: data.budgetTotal,
        budgetSpent: data.budgetSpent,
        leadGoal: data.leadGoal,
        sampleGoal: data.sampleGoal,
        interactionGoal: data.interactionGoal,
        tags: data.tags,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy || ctx.userEmail,
      })
      .returning();

    // Auto-create #general chat channel for the activation
    const channelId = `ch-${crypto.randomUUID().slice(0, 8)}`;
    await db
      .insert(schema.chatChannels)
      .values({
        id: channelId,
        projectId: id,
        name: "general",
        description: "General discussion channel",
        createdBy: data.createdBy || ctx.userEmail,
        createdAt: now,
        isDefault: true,
      });

    return NextResponse.json(newActivation[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations error:", error);
    return NextResponse.json({ error: "Failed to create activation" }, { status: 500 });
  }
}
