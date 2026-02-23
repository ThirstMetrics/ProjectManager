import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    const activations = await db.select().from(schema.activations);
    return NextResponse.json(activations);
  } catch (error) {
    console.error("GET /api/activations error:", error);
    return NextResponse.json({ error: "Failed to fetch activations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const id = `act-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Create activation
    const newActivation = await db
      .insert(schema.activations)
      .values({
        id,
        name: body.name || "New Activation",
        brand: body.brand || "",
        description: body.description || "",
        color: body.color || "#f59e0b",
        icon: body.icon || "Zap",
        phase: body.phase || "planning",
        status: body.status || "draft",
        eventDate: body.eventDate || now,
        eventEndDate: body.eventEndDate || null,
        setupDate: body.setupDate || null,
        teardownDate: body.teardownDate || null,
        venueId: body.venueId || null,
        budgetTotal: body.budgetTotal || 0,
        budgetSpent: body.budgetSpent || 0,
        leadGoal: body.leadGoal || 0,
        sampleGoal: body.sampleGoal || 0,
        interactionGoal: body.interactionGoal || 0,
        tags: body.tags || [],
        createdAt: now,
        updatedAt: now,
        createdBy: body.createdBy || "",
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
        createdBy: body.createdBy || "",
        createdAt: now,
        isDefault: true,
      });

    return NextResponse.json(newActivation[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations error:", error);
    return NextResponse.json({ error: "Failed to create activation" }, { status: 500 });
  }
}
