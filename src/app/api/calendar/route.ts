import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const eventsList = await db.select().from(schema.calendarEvents);
    return NextResponse.json(eventsList);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const id = `evt-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;

    const eventData = {
      id,
      projectId: body.projectId || null,
      taskId: body.taskId || null,
      title: body.title,
      description: body.description || "",
      start: body.start,
      end: body.end,
      allDay: body.allDay || false,
      color: body.color || "#6366f1",
      type: body.type || "event",
    };

    const event = await db
      .insert(schema.calendarEvents)
      .values(eventData)
      .returning();

    return NextResponse.json(event[0], { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();

    const updated = await db
      .update(schema.calendarEvents)
      .set(body)
      .where(eq(schema.calendarEvents.id, body.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
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
      .delete(schema.calendarEvents)
      .where(eq(schema.calendarEvents.id, body.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
