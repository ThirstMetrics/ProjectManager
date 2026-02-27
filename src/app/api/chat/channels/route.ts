import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { validateBody, channelCreateSchema, channelDeleteSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const channelsList = await db.select().from(schema.chatChannels);
    return NextResponse.json(channelsList);
  } catch (error) {
    console.error("Error fetching chat channels:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat channels" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, channelCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `ch-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const channelData = {
      id,
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: now,
      isDefault: data.isDefault,
    };

    const channel = await db
      .insert(schema.chatChannels)
      .values(channelData)
      .returning();

    return NextResponse.json(channel[0], { status: 201 });
  } catch (error) {
    console.error("Error creating chat channel:", error);
    return NextResponse.json(
      { error: "Failed to create chat channel" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, channelDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.chatChannels)
      .where(eq(schema.chatChannels.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting chat channel:", error);
    return NextResponse.json(
      { error: "Failed to delete chat channel" },
      { status: 500 }
    );
  }
}
