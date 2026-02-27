import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const projectsList = await db.select().from(schema.projects);
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
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const id = `proj-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    // Create the project
    const projectData = {
      id,
      name: body.name,
      description: body.description || "",
      type: body.type || "general",
      color: body.color || "#6366f1",
      icon: body.icon || "Folder",
      status: body.status || "active",
      startDate: body.startDate || now,
      endDate: body.endDate || null,
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
      createdBy: body.createdBy || "system",
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
