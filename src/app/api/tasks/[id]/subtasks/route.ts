import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Read current task
    const task = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));

    if (task.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const currentTask = task[0];
    const subtaskId = `st-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const newSubtask = {
      id: subtaskId,
      title: body.title,
      completed: false,
    };

    const updatedSubtasks = [...(currentTask.subtasks || []), newSubtask];
    const now = new Date().toISOString();

    const updated = await db
      .update(schema.tasks)
      .set({
        subtasks: updatedSubtasks,
        updatedAt: now,
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    return NextResponse.json(updated[0], { status: 201 });
  } catch (error) {
    console.error("Error creating subtask:", error);
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Read current task
    const task = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));

    if (task.length === 0) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const currentTask = task[0];
    const subtaskId = body.subtaskId;

    // Toggle the completed boolean of the matching subtask
    const updatedSubtasks = currentTask.subtasks.map((st: any) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const now = new Date().toISOString();

    const updated = await db
      .update(schema.tasks)
      .set({
        subtasks: updatedSubtasks,
        updatedAt: now,
      })
      .where(eq(schema.tasks.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating subtask:", error);
    return NextResponse.json(
      { error: "Failed to update subtask" },
      { status: 500 }
    );
  }
}
