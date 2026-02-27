import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { validateBody, milestoneCreateSchema, milestoneUpdateSchema, deleteByIdSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const milestonesList = await db.select().from(schema.milestones);
    return NextResponse.json(milestonesList);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      { error: "Failed to fetch milestones" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, milestoneCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `ms-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;

    const milestoneData = {
      id,
      projectId: data.projectId,
      title: data.title,
      dueDate: data.dueDate,
      completed: data.completed,
    };

    const milestone = await db
      .insert(schema.milestones)
      .values(milestoneData)
      .returning();

    return NextResponse.json(milestone[0], { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, milestoneUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const updateData: Record<string, unknown> = { ...data };

    // If completed field is not explicitly provided but this is a toggle request,
    // read current value and toggle it
    if (!("completed" in data) && data.toggle) {
      const current = await db
        .select()
        .from(schema.milestones)
        .where(eq(schema.milestones.id, data.id));

      if (current.length === 0) {
        return NextResponse.json(
          { error: "Milestone not found" },
          { status: 404 }
        );
      }

      updateData.completed = !current[0].completed;
    }

    // Remove toggle from update data since it's not a DB field
    delete updateData.toggle;

    const updated = await db
      .update(schema.milestones)
      .set(updateData)
      .where(eq(schema.milestones.id, data.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
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
      .delete(schema.milestones)
      .where(eq(schema.milestones.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
