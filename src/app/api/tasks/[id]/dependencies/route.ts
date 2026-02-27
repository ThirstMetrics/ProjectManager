import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { validateBody, dependencySchema } from "@/lib/validation";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, dependencySchema);
  if (data instanceof NextResponse) return data;

  try {
    const { id } = await params;

    await db.insert(schema.taskDependencies).values({
      taskId: id,
      dependsOnId: data.dependsOnId,
    });

    return NextResponse.json(
      { message: "Dependency created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task dependency:", error);
    return NextResponse.json(
      { error: "Failed to create task dependency" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, dependencySchema);
  if (data instanceof NextResponse) return data;

  try {
    const { id } = await params;

    await db
      .delete(schema.taskDependencies)
      .where(
        and(
          eq(schema.taskDependencies.taskId, id),
          eq(schema.taskDependencies.dependsOnId, data.dependsOnId)
        )
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting task dependency:", error);
    return NextResponse.json(
      { error: "Failed to delete task dependency" },
      { status: 500 }
    );
  }
}
