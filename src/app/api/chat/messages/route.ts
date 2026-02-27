import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { validateBody, messageCreateSchema, messageUpdateSchema, messageDeleteSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const messagesList = await db.select().from(schema.chatMessages);
    return NextResponse.json(messagesList);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, messageCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `msg-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const messageData = {
      id,
      channelId: data.channelId,
      projectId: data.projectId,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      threadId: data.threadId,
      mentions: data.mentions,
      timestamp: now,
      edited: false,
    };

    const message = await db
      .insert(schema.chatMessages)
      .values(messageData)
      .returning();

    return NextResponse.json(message[0], { status: 201 });
  } catch (error) {
    console.error("Error creating chat message:", error);
    return NextResponse.json(
      { error: "Failed to create chat message" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, messageUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    // Check ownership: only the sender or a global admin can edit
    const [message] = await db
      .select({ senderId: schema.chatMessages.senderId })
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.id, data.id))
      .limit(1);

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    if (message.senderId !== ctx.userId && ctx.globalRole !== "owner" && ctx.globalRole !== "admin") {
      return NextResponse.json(
        { error: "You can only edit your own messages" },
        { status: 403 }
      );
    }

    const updated = await db
      .update(schema.chatMessages)
      .set({
        content: data.content,
        edited: true,
      })
      .where(eq(schema.chatMessages.id, data.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating chat message:", error);
    return NextResponse.json(
      { error: "Failed to update chat message" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, messageDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    // Check ownership: only the sender or a global admin can delete
    const [message] = await db
      .select({ senderId: schema.chatMessages.senderId })
      .from(schema.chatMessages)
      .where(eq(schema.chatMessages.id, data.id))
      .limit(1);

    if (message && message.senderId !== ctx.userId && ctx.globalRole !== "owner" && ctx.globalRole !== "admin") {
      return NextResponse.json(
        { error: "You can only delete your own messages" },
        { status: 403 }
      );
    }

    await db
      .delete(schema.chatMessages)
      .where(eq(schema.chatMessages.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json(
      { error: "Failed to delete chat message" },
      { status: 500 }
    );
  }
}
