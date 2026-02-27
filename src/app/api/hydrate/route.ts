import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
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
      db.select().from(schema.projects),
      db.select().from(schema.tasks),
      db.select().from(schema.taskDependencies),
      db.select().from(schema.milestones),
      db.select().from(schema.teamMembers),
      db.select().from(schema.activityLog),
      db.select().from(schema.chatChannels),
      db.select().from(schema.chatMessages),
      db.select().from(schema.calendarEvents),
      db.select().from(schema.fileItems),
      db.select().from(schema.notifications),
      db.select().from(schema.notificationPreferences).where(eq(schema.notificationPreferences.id, "default")),
      db.select().from(schema.activations),
      db.select().from(schema.activationVenues),
      db.select().from(schema.activationStakeholders),
      db.select().from(schema.activationProducts),
      db.select().from(schema.activationPersonnel),
      db.select().from(schema.activationLeads),
      db.select().from(schema.activationBudgetItems),
      db.select().from(schema.activationDocuments),
      db.select().from(schema.activationChecklists),
      db.select().from(schema.activationIssues),
      db.select().from(schema.activationMedia),
      db.select().from(schema.activationRunOfShow),
      db.select().from(schema.activationReports),
    ]);

    // Compute dependencies and dependents for tasks
    const tasksWithDependencies = tasksData.map((task) => {
      const dependencies = taskDependenciesData
        .filter((dep) => dep.taskId === task.id)
        .map((dep) => dep.dependsOnId);

      const dependents = taskDependenciesData
        .filter((dep) => dep.dependsOnId === task.id)
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
