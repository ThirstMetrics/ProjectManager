import { z } from "zod";
import { NextResponse } from "next/server";

/**
 * Validate a request body against a Zod schema.
 * Returns the parsed data on success, or a NextResponse 400 on failure.
 * Unknown keys are stripped automatically.
 */
export async function validateBody<T extends z.ZodType>(
  req: Request,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return NextResponse.json(
      { error: "Validation failed", details },
      { status: 400 }
    );
  }

  return result.data;
}

// Re-export everything for convenience
export { z } from "zod";
export * from "./validation/enums";
export * from "./validation/core";
export * from "./validation/activation";
export * from "./validation/chat";
export * from "./validation/calendar";
export * from "./validation/files";
export * from "./validation/notifications";
export * from "./validation/auth";
