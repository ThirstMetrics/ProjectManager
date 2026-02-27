import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const tasksList = await db.select().from(schema.tasks);
    return NextResponse.json(tasksList);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const id = `task-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    // Count tasks with same projectId to set order
    const existingTasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.projectId, body.projectId));

    const order = existingTasks.length;

    const taskData = {
      id,
      projectId: body.projectId,
      title: body.title,
      description: body.description || "",
      status: body.status || "backlog",
      priority: body.priority || "medium",
      assignee: body.assignee || null,
      dueDate: body.dueDate || null,
      startDate: body.startDate || null,
      tags: body.tags || [],
      subtasks: body.subtasks || [],
      attachments: body.attachments || [],
      approvalRequired: body.approvalRequired || false,
      approver: body.approver || null,
      approvalStatus: body.approvalStatus || "none",
      approvalComment: body.approvalComment || null,
      approvalRequestedAt: body.approvalRequestedAt || null,
      createdAt: now,
      updatedAt: now,
      completedAt: body.completedAt || null,
      order,
    };

    const task = await db
      .insert(schema.tasks)
      .values(taskData)
      .returning();

    return NextResponse.json(task[0], { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
