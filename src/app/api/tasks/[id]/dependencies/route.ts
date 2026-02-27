import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    await db.insert(schema.taskDependencies).values({
      taskId: id,
      dependsOnId: body.dependsOnId,
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;
    const body = await req.json();

    await db
      .delete(schema.taskDependencies)
      .where(
        and(
          eq(schema.taskDependencies.taskId, id),
          eq(schema.taskDependencies.dependsOnId, body.dependsOnId)
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
