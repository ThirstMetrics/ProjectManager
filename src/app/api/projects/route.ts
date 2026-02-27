import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { requireRole } from "@/lib/rbac";
import { validateBody, projectCreateSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    // Admins/owners see all projects; members/viewers see only their projects
    if (ctx.globalRole === "owner" || ctx.globalRole === "admin") {
      const projectsList = await db.select().from(schema.projects);
      return NextResponse.json(projectsList);
    }

    // Get project IDs where user is an active team member
    const memberships = await db
      .select({ projectId: schema.teamMembers.projectId })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.email, ctx.userEmail));

    const projectIds = memberships.map((m) => m.projectId);
    if (projectIds.length === 0) {
      return NextResponse.json([]);
    }

    const projectsList = await db
      .select()
      .from(schema.projects)
      .where(inArray(schema.projects.id, projectIds));

    return NextResponse.json(projectsList);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireRole("member");
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, projectCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `proj-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const projectData = {
      id,
      name: data.name,
      description: data.description,
      type: data.type,
      color: data.color,
      icon: data.icon,
      status: data.status,
      startDate: data.startDate || now,
      endDate: data.endDate,
      createdAt: now,
      updatedAt: now,
    };

    const project = await db
      .insert(schema.projects)
      .values(projectData)
      .returning();

    // Auto-create #general chat channel
    const channelId = `ch-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    await db.insert(schema.chatChannels).values({
      id: channelId,
      projectId: id,
      name: "general",
      description: "General discussion channel",
      createdBy: data.createdBy,
      createdAt: now,
      isDefault: true,
    });

    return NextResponse.json(project[0], { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
