import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET() {
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
  try {
    const body = await req.json();
    const id = `msg-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const messageData = {
      id,
      channelId: body.channelId,
      projectId: body.projectId,
      senderId: body.senderId,
      senderName: body.senderName,
      content: body.content,
      threadId: body.threadId || null,
      mentions: body.mentions || [],
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
  try {
    const body = await req.json();

    const updated = await db
      .update(schema.chatMessages)
      .set({
        content: body.content,
        edited: true,
      })
      .where(eq(schema.chatMessages.id, body.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

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
  try {
    const body = await req.json();

    await db
      .delete(schema.chatMessages)
      .where(eq(schema.chatMessages.id, body.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json(
      { error: "Failed to delete chat message" },
      { status: 500 }
    );
  }
}
