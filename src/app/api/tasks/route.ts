import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { requireProjectAccess } from "@/lib/rbac";
import { validateBody, taskCreateSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    // Admins/owners see all tasks; others see tasks from their projects
    if (ctx.globalRole === "owner" || ctx.globalRole === "admin") {
      const tasksList = await db.select().from(schema.tasks);
      return NextResponse.json(tasksList);
    }

    const memberships = await db
      .select({ projectId: schema.teamMembers.projectId })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.email, ctx.userEmail));

    const projectIds = memberships.map((m) => m.projectId);
    if (projectIds.length === 0) {
      return NextResponse.json([]);
    }

    const tasksList = await db
      .select()
      .from(schema.tasks)
      .where(inArray(schema.tasks.projectId, projectIds));

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
  // First validate body to get projectId
  const data = await validateBody(req, taskCreateSchema);
  if (data instanceof NextResponse) return data;

  // Check project access (contributor+ can create tasks)
  const result = await requireProjectAccess(data.projectId, "contributor");
  if (result instanceof NextResponse) return result;

  try {
    const id = `task-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    // Count tasks with same projectId to set order
    const existingTasks = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.projectId, data.projectId));

    const order = existingTasks.length;

    const taskData = {
      id,
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      dueDate: data.dueDate,
      startDate: data.startDate,
      tags: data.tags,
      subtasks: data.subtasks,
      attachments: data.attachments,
      approvalRequired: data.approvalRequired,
      approver: data.approver,
      approvalStatus: data.approvalStatus,
      approvalComment: data.approvalComment,
      approvalRequestedAt: data.approvalRequestedAt,
      createdAt: now,
      updatedAt: now,
      completedAt: data.completedAt,
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
