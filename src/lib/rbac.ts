import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireAuth, type AuthContext } from "./auth-guard";

// ─── Role Hierarchies ─────────────────────────────────────────
const GLOBAL_ROLE_LEVEL: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

const PROJECT_ROLE_LEVEL: Record<string, number> = {
  owner: 4,
  manager: 3,
  contributor: 2,
  viewer: 1,
};

type GlobalRole = "owner" | "admin" | "member" | "viewer";
type ProjectRole = "owner" | "manager" | "contributor" | "viewer";

// ─── Global Role Guard ────────────────────────────────────────
/**
 * Require a minimum global role.
 * Returns AuthContext on success, or NextResponse 403/401 on failure.
 */
export async function requireRole(
  minRole: GlobalRole
): Promise<AuthContext | NextResponse> {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  const userLevel = GLOBAL_ROLE_LEVEL[ctx.globalRole] ?? 0;
  const requiredLevel = GLOBAL_ROLE_LEVEL[minRole] ?? 0;

  if (userLevel < requiredLevel) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 }
    );
  }

  return ctx;
}

// ─── Project Access Guard ─────────────────────────────────────
export interface ProjectAccess {
  role: ProjectRole;
}

/**
 * Require access to a specific project, optionally with a minimum project role.
 * Global owner/admin bypasses project membership check.
 */
export async function requireProjectAccess(
  projectId: string,
  minRole?: ProjectRole
): Promise<[AuthContext, ProjectAccess] | NextResponse> {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  // Global owner/admin → full access (treated as project owner)
  const globalLevel = GLOBAL_ROLE_LEVEL[ctx.globalRole] ?? 0;
  if (globalLevel >= GLOBAL_ROLE_LEVEL.admin) {
    return [ctx, { role: "owner" as ProjectRole }];
  }

  // Look up team membership
  const [member] = await db
    .select()
    .from(schema.teamMembers)
    .where(
      and(
        eq(schema.teamMembers.projectId, projectId),
        eq(schema.teamMembers.email, ctx.userEmail),
        eq(schema.teamMembers.status, "active")
      )
    )
    .limit(1);

  if (!member) {
    return NextResponse.json(
      { error: "You do not have access to this project" },
      { status: 403 }
    );
  }

  const memberRole = (member.role || "viewer") as ProjectRole;

  if (minRole) {
    const memberLevel = PROJECT_ROLE_LEVEL[memberRole] ?? 0;
    const requiredLevel = PROJECT_ROLE_LEVEL[minRole] ?? 0;
    if (memberLevel < requiredLevel) {
      return NextResponse.json(
        { error: "Insufficient project permissions" },
        { status: 403 }
      );
    }
  }

  return [ctx, { role: memberRole }];
}

// ─── Activation Access Guard ──────────────────────────────────
export interface ActivationAccess {
  role: "creator" | "stakeholder" | "admin";
  canViewBudget: boolean;
  canViewLeads: boolean;
  canViewAllDocuments: boolean;
}

/**
 * Require access to a specific activation.
 * Global owner/admin → full access.
 * Activation creator → full access.
 * Activation stakeholder → scoped access based on permissions.
 */
export async function requireActivationAccess(
  activationId: string,
  options?: { requireBudgetAccess?: boolean; requireLeadAccess?: boolean }
): Promise<[AuthContext, ActivationAccess] | NextResponse> {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;

  // Global owner/admin → full access
  const globalLevel = GLOBAL_ROLE_LEVEL[ctx.globalRole] ?? 0;
  if (globalLevel >= GLOBAL_ROLE_LEVEL.admin) {
    return [ctx, { role: "admin", canViewBudget: true, canViewLeads: true, canViewAllDocuments: true }];
  }

  // Check if user is the activation creator
  const [activation] = await db
    .select({ createdBy: schema.activations.createdBy })
    .from(schema.activations)
    .where(eq(schema.activations.id, activationId))
    .limit(1);

  if (!activation) {
    return NextResponse.json(
      { error: "Activation not found" },
      { status: 404 }
    );
  }

  if (activation.createdBy === ctx.userId || activation.createdBy === ctx.userEmail) {
    return [ctx, { role: "creator", canViewBudget: true, canViewLeads: true, canViewAllDocuments: true }];
  }

  // Check if user is a stakeholder
  const [stakeholder] = await db
    .select()
    .from(schema.activationStakeholders)
    .where(
      and(
        eq(schema.activationStakeholders.activationId, activationId),
        eq(schema.activationStakeholders.email, ctx.userEmail)
      )
    )
    .limit(1);

  if (!stakeholder) {
    return NextResponse.json(
      { error: "You do not have access to this activation" },
      { status: 403 }
    );
  }

  const access: ActivationAccess = {
    role: "stakeholder",
    canViewBudget: stakeholder.canViewBudget ?? false,
    canViewLeads: stakeholder.canViewLeads ?? false,
    canViewAllDocuments: stakeholder.canViewAllDocuments ?? false,
  };

  // Check specific access requirements
  if (options?.requireBudgetAccess && !access.canViewBudget) {
    return NextResponse.json(
      { error: "You do not have budget access for this activation" },
      { status: 403 }
    );
  }

  if (options?.requireLeadAccess && !access.canViewLeads) {
    return NextResponse.json(
      { error: "You do not have lead access for this activation" },
      { status: 403 }
    );
  }

  return [ctx, access];
}
