import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const filesList = await db.select().from(schema.fileItems);
    return NextResponse.json(filesList);
  } catch (error) {
    console.error("Error fetching file items:", error);
    return NextResponse.json(
      { error: "Failed to fetch file items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();
    const id = `file-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const fileData = {
      id,
      projectId: body.projectId,
      name: body.name,
      size: body.size || 0,
      type: body.type || "",
      url: body.url || "",
      folder: body.folder || "",
      uploadedBy: body.uploadedBy,
      uploadedAt: now,
      tags: body.tags || [],
    };

    const file = await db
      .insert(schema.fileItems)
      .values(fileData)
      .returning();

    return NextResponse.json(file[0], { status: 201 });
  } catch (error) {
    console.error("Error creating file item:", error);
    return NextResponse.json(
      { error: "Failed to create file item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const body = await req.json();

    await db
      .delete(schema.fileItems)
      .where(eq(schema.fileItems.id, body.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting file item:", error);
    return NextResponse.json(
      { error: "Failed to delete file item" },
      { status: 500 }
    );
  }
}
