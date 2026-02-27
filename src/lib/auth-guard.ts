import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export interface AuthContext {
  userId: string;
  userEmail: string;
  globalRole: string;
}

/**
 * Require authentication and return typed context.
 * Returns AuthContext on success, or NextResponse 401 on failure.
 */
export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  return {
    userId: session.user.id,
    userEmail: session.user.email,
    globalRole: session.user.role ?? "member",
  };
}
