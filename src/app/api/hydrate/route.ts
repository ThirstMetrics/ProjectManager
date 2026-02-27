import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const ctx = await requireAuth();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const isAdmin = ctx.globalRole === "owner" || ctx.globalRole === "admin";

    // If admin/owner, load everything; otherwise filter by membership
    let projectIds: string[] | null = null;
    let activationIds: string[] | null = null;

    if (!isAdmin) {
      // Get user's project memberships
      const memberships = await db
        .select({ projectId: schema.teamMembers.projectId })
        .from(schema.teamMembers)
        .where(eq(schema.teamMembers.email, ctx.userEmail));
      projectIds = memberships.map((m) => m.projectId);

      // Get activations user created or is a stakeholder of
      const createdActivations = await db
        .select({ id: schema.activations.id })
        .from(schema.activations)
        .where(eq(schema.activations.createdBy, ctx.userEmail));

      const stakeholderActivations = await db
        .select({ activationId: schema.activationStakeholders.activationId })
        .from(schema.activationStakeholders)
        .where(eq(schema.activationStakeholders.email, ctx.userEmail));

      activationIds = [
        ...new Set([
          ...createdActivations.map((a) => a.id),
          ...stakeholderActivations.map((s) => s.activationId),
        ]),
      ];
    }

    // Fetch all data in parallel
    const [
      projectsData,
      tasksData,
      taskDependenciesData,
      milestonesData,
      teamMembersData,
      activityLogData,
      chatChannelsData,
      chatMessagesData,
      calendarEventsData,
      fileItemsData,
      notificationsData,
      notificationPreferencesData,
      activationsData,
      activationVenuesData,
      activationStakeholdersData,
      activationProductsData,
      activationPersonnelData,
      activationLeadsData,
      activationBudgetItemsData,
      activationDocumentsData,
      activationChecklistsData,
      activationIssuesData,
      activationMediaData,
      activationRunOfShowData,
      activationReportsData,
    ] = await Promise.all([
      // Projects
      isAdmin
        ? db.select().from(schema.projects)
        : projectIds!.length > 0
          ? db.select().from(schema.projects).where(inArray(schema.projects.id, projectIds!))
          : Promise.resolve([]),
      // Tasks
      isAdmin
        ? db.select().from(schema.tasks)
        : projectIds!.length > 0
          ? db.select().from(schema.tasks).where(inArray(schema.tasks.projectId, projectIds!))
          : Promise.resolve([]),
      // Task dependencies (always fetch all, filter below)
      db.select().from(schema.taskDependencies),
      // Milestones
      isAdmin
        ? db.select().from(schema.milestones)
        : projectIds!.length > 0
          ? db.select().from(schema.milestones).where(inArray(schema.milestones.projectId, projectIds!))
          : Promise.resolve([]),
      // Team members
      isAdmin
        ? db.select().from(schema.teamMembers)
        : projectIds!.length > 0
          ? db.select().from(schema.teamMembers).where(inArray(schema.teamMembers.projectId, projectIds!))
          : Promise.resolve([]),
      // Activity log
      isAdmin
        ? db.select().from(schema.activityLog)
        : projectIds!.length > 0
          ? db.select().from(schema.activityLog).where(inArray(schema.activityLog.projectId, projectIds!))
          : Promise.resolve([]),
      // Chat channels
      isAdmin
        ? db.select().from(schema.chatChannels)
        : projectIds!.length > 0
          ? db.select().from(schema.chatChannels).where(inArray(schema.chatChannels.projectId, projectIds!))
          : Promise.resolve([]),
      // Chat messages
      isAdmin
        ? db.select().from(schema.chatMessages)
        : projectIds!.length > 0
          ? db.select().from(schema.chatMessages).where(inArray(schema.chatMessages.projectId, projectIds!))
          : Promise.resolve([]),
      // Calendar events (no project scoping for now)
      db.select().from(schema.calendarEvents),
      // File items
      isAdmin
        ? db.select().from(schema.fileItems)
        : projectIds!.length > 0
          ? db.select().from(schema.fileItems).where(inArray(schema.fileItems.projectId, projectIds!))
          : Promise.resolve([]),
      // Notifications (user-global for now)
      db.select().from(schema.notifications),
      db.select().from(schema.notificationPreferences).where(eq(schema.notificationPreferences.id, "default")),
      // Activations
      isAdmin
        ? db.select().from(schema.activations)
        : activationIds!.length > 0
          ? db.select().from(schema.activations).where(inArray(schema.activations.id, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationVenues)
        : activationIds!.length > 0
          ? db.select().from(schema.activationVenues).where(inArray(schema.activationVenues.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationStakeholders)
        : activationIds!.length > 0
          ? db.select().from(schema.activationStakeholders).where(inArray(schema.activationStakeholders.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationProducts)
        : activationIds!.length > 0
          ? db.select().from(schema.activationProducts).where(inArray(schema.activationProducts.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationPersonnel)
        : activationIds!.length > 0
          ? db.select().from(schema.activationPersonnel).where(inArray(schema.activationPersonnel.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationLeads)
        : activationIds!.length > 0
          ? db.select().from(schema.activationLeads).where(inArray(schema.activationLeads.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationBudgetItems)
        : activationIds!.length > 0
          ? db.select().from(schema.activationBudgetItems).where(inArray(schema.activationBudgetItems.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationDocuments)
        : activationIds!.length > 0
          ? db.select().from(schema.activationDocuments).where(inArray(schema.activationDocuments.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationChecklists)
        : activationIds!.length > 0
          ? db.select().from(schema.activationChecklists).where(inArray(schema.activationChecklists.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationIssues)
        : activationIds!.length > 0
          ? db.select().from(schema.activationIssues).where(inArray(schema.activationIssues.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationMedia)
        : activationIds!.length > 0
          ? db.select().from(schema.activationMedia).where(inArray(schema.activationMedia.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationRunOfShow)
        : activationIds!.length > 0
          ? db.select().from(schema.activationRunOfShow).where(inArray(schema.activationRunOfShow.activationId, activationIds!))
          : Promise.resolve([]),
      isAdmin
        ? db.select().from(schema.activationReports)
        : activationIds!.length > 0
          ? db.select().from(schema.activationReports).where(inArray(schema.activationReports.activationId, activationIds!))
          : Promise.resolve([]),
    ]);

    // Compute dependencies and dependents for tasks
    const taskIdSet = new Set(tasksData.map((t) => t.id));
    const tasksWithDependencies = tasksData.map((task) => {
      const dependencies = taskDependenciesData
        .filter((dep) => dep.taskId === task.id && taskIdSet.has(dep.dependsOnId))
        .map((dep) => dep.dependsOnId);

      const dependents = taskDependenciesData
        .filter((dep) => dep.dependsOnId === task.id && taskIdSet.has(dep.taskId))
        .map((dep) => dep.taskId);

      return {
        ...task,
        dependencies,
        dependents,
      };
    });

    // Get the first (and only) notification preferences row
    const notificationPreferences = notificationPreferencesData[0] || null;

    // Return all data
    return NextResponse.json({
      projects: projectsData,
      tasks: tasksWithDependencies,
      milestones: milestonesData,
      events: calendarEventsData,
      files: fileItemsData,
      notifications: notificationsData,
      notificationPreferences,
      teamMembers: teamMembersData,
      activityLog: activityLogData,
      chatChannels: chatChannelsData,
      chatMessages: chatMessagesData,
      activations: activationsData,
      activationVenues: activationVenuesData,
      activationStakeholders: activationStakeholdersData,
      activationProducts: activationProductsData,
      activationPersonnel: activationPersonnelData,
      activationLeads: activationLeadsData,
      activationBudgetItems: activationBudgetItemsData,
      activationDocuments: activationDocumentsData,
      activationChecklists: activationChecklistsData,
      activationIssues: activationIssuesData,
      activationMedia: activationMediaData,
      activationRunOfShow: activationRunOfShowData,
      activationReports: activationReportsData,
    });
  } catch (error) {
    console.error("Error hydrating data:", error);
    return NextResponse.json(
      { error: "Failed to hydrate data" },
      { status: 500 }
    );
  }
}
