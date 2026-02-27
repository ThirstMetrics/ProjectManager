import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { validateBody, notificationCreateSchema, notificationUpdateSchema, deleteByIdSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, notificationCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `notif-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const notificationData = {
      id,
      title: data.title,
      message: data.message,
      type: data.type,
      channel: data.channel,
      read: false,
      actionUrl: data.actionUrl || null,
      projectId: data.projectId,
      taskId: data.taskId,
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, notificationUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    // Handle preferences update
    if (data.preferences === true) {
      const prefUpdateData = { ...data };
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
    if (data.markAllRead === true) {
      await db.update(schema.notifications).set({ read: true });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    // Handle single notification read
    if (data.id && "read" in data) {
      const updated = await db
        .update(schema.notifications)
        .set({ read: data.read })
        .where(eq(schema.notifications.id, data.id))
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, deleteByIdSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.notifications)
      .where(eq(schema.notifications.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
