import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { desc } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const activityList = await db
      .select()
      .from(schema.activityLog)
      .orderBy(desc(schema.activityLog.timestamp));

    return NextResponse.json(activityList);
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const id = `al-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const activityData = {
      id,
      projectId: body.projectId,
      memberId: body.memberId,
      memberName: body.memberName,
      action: body.action,
      target: body.target,
      timestamp: now,
    };

    const activity = await db
      .insert(schema.activityLog)
      .values(activityData)
      .returning();

    return NextResponse.json(activity[0], { status: 201 });
  } catch (error) {
    console.error("Error creating activity log entry:", error);
    return NextResponse.json(
      { error: "Failed to create activity log entry" },
      { status: 500 }
    );
  }
}
