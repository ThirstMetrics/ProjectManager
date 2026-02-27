import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { validateBody, calendarEventCreateSchema, calendarEventUpdateSchema, calendarEventDeleteSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, calendarEventCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `evt-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;

    const eventData = {
      id,
      projectId: data.projectId,
      taskId: data.taskId,
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      allDay: data.allDay,
      color: data.color,
      type: data.type,
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, calendarEventUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const updated = await db
      .update(schema.calendarEvents)
      .set(data)
      .where(eq(schema.calendarEvents.id, data.id))
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, calendarEventDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.calendarEvents)
      .where(eq(schema.calendarEvents.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
