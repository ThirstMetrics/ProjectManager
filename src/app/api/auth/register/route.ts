import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateBody, registerSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const data = await validateBody(req, registerSchema);
  if (data instanceof NextResponse) return data;

  try {
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 12);
    const id = `user-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    await db.insert(schema.users).values({
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: "member",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { id, name: data.name, email: data.email.toLowerCase() },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
