import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const url = new URL(req.url);
    const isPreferences = url.searchParams.get("preferences") === "true";

    if (isPreferences) {
      const prefs = await db
        .select()
        .from(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.id, "default"));

      if (prefs.length === 0) {
        return NextResponse.json(
          { error: "Preferences not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(prefs[0]);
    }

    const notificationsList = await db.select().from(schema.notifications);
    return NextResponse.json(notificationsList);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const id = `notif-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const notificationData = {
      id,
      title: body.title,
      message: body.message,
      type: body.type || "info",
      channel: body.channel || ["screen"],
      read: false,
      actionUrl: body.actionUrl || null,
      projectId: body.projectId || null,
      taskId: body.taskId || null,
      createdAt: now,
    };

    const notification = await db
      .insert(schema.notifications)
      .values(notificationData)
      .returning();

    return NextResponse.json(notification[0], { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();

    // Handle preferences update
    if (body.preferences === true) {
      const prefUpdateData = { ...body };
      delete prefUpdateData.preferences;

      const updated = await db
        .update(schema.notificationPreferences)
        .set(prefUpdateData)
        .where(eq(schema.notificationPreferences.id, "default"))
        .returning();

      if (updated.length === 0) {
        return NextResponse.json(
          { error: "Preferences not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(updated[0]);
    }

    // Handle markAllRead
    if (body.markAllRead === true) {
      await db.update(schema.notifications).set({ read: true });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    // Handle single notification read
    if (body.id && "read" in body) {
      const updated = await db
        .update(schema.notifications)
        .set({ read: body.read })
        .where(eq(schema.notifications.id, body.id))
        .returning();

      if (updated.length === 0) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(updated[0]);
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();

    await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.id, body.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
