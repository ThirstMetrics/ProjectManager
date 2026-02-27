import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";
import { requireProjectAccess } from "@/lib/rbac";
import { validateBody, teamMemberCreateSchema, teamMemberUpdateSchema, deleteByIdSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const teamList = await db.select().from(schema.teamMembers);
    return NextResponse.json(teamList);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await validateBody(req, teamMemberCreateSchema);
  if (data instanceof NextResponse) return data;

  // Manager+ can invite members to a project
  const result = await requireProjectAccess(data.projectId, "manager");
  if (result instanceof NextResponse) return result;

  try {
    const id = `tm-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const teamMemberData = {
      id,
      projectId: data.projectId,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.avatar || null,
      invitedBy: data.invitedBy || null,
      joinedAt: now,
      lastLoginAt: now,
      status: data.status,
    };

    const teamMember = await db
      .insert(schema.teamMembers)
      .values(teamMemberData)
      .returning();

    return NextResponse.json(teamMember[0], { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, teamMemberUpdateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const updated = await db
      .update(schema.teamMembers)
      .set(data)
      .where(eq(schema.teamMembers.id, data.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
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
      .delete(schema.teamMembers)
      .where(eq(schema.teamMembers.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
