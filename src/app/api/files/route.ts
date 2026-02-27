import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { validateBody, fileCreateSchema, fileDeleteSchema } from "@/lib/validation";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, fileCreateSchema);
  if (data instanceof NextResponse) return data;

  try {
    const id = `file-${crypto.getRandomValues(new Uint8Array(4)).reduce((acc, val) => acc + val.toString(16).padStart(2, "0"), "")}`;
    const now = new Date().toISOString();

    const fileData = {
      id,
      projectId: data.projectId,
      name: data.name,
      size: data.size,
      type: data.type,
      url: data.url,
      folder: data.folder,
      uploadedBy: data.uploadedBy,
      uploadedAt: now,
      tags: data.tags,
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
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const data = await validateBody(req, fileDeleteSchema);
  if (data instanceof NextResponse) return data;

  try {
    await db
      .delete(schema.fileItems)
      .where(eq(schema.fileItems.id, data.id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting file item:", error);
    return NextResponse.json(
      { error: "Failed to delete file item" },
      { status: 500 }
    );
  }
}
