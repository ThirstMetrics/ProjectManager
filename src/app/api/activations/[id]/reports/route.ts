import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  if (session instanceof NextResponse) return session;
  try {
    const { id } = await params;

    const reportId = `rpt-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    // Fetch activation
    const activationData = await db
      .select()
      .from(schema.activations)
      .where(eq(schema.activations.id, id));

    if (!activationData || activationData.length === 0) {
      return NextResponse.json({ error: "Activation not found" }, { status: 404 });
    }

    const activation = activationData[0];

    // Fetch leads
    const leads = await db
      .select()
      .from(schema.activationLeads)
      .where(eq(schema.activationLeads.activationId, id));

    // Fetch products
    const products = await db
      .select()
      .from(schema.activationProducts)
      .where(eq(schema.activationProducts.activationId, id));

    // Fetch budget items
    const budgetItems = await db
      .select()
      .from(schema.activationBudgetItems)
      .where(eq(schema.activationBudgetItems.activationId, id));

    // Calculate metrics
    const totalLeads = leads.length;
    const totalSamples = products.reduce((sum, p) => sum + (p.quantityUsed || 0), 0);
    const totalBudgetSpent = budgetItems.reduce(
      (sum, b) => sum + (b.actualAmount || b.estimatedAmount || 0),
      0
    );
    const totalInteractions = activation.interactionGoal || 0;

    // Calculate cost per metrics
    const costPerLead = totalLeads > 0 ? Math.round(totalBudgetSpent / totalLeads) : 0;
    const costPerSample = totalSamples > 0 ? Math.round(totalBudgetSpent / totalSamples) : 0;
    const costPerInteraction = totalInteractions > 0 ? Math.round(totalBudgetSpent / totalInteractions) : 0;

    const newReport = await db
      .insert(schema.activationReports)
      .values({
        id: reportId,
        activationId: id,
        title: `Report for ${activation.name}`,
        summary: "",
        totalLeads,
        totalSamples,
        totalInteractions,
        totalBudgetSpent,
        costPerLead,
        costPerSample,
        costPerInteraction,
        highlights: [],
        challenges: [],
        recommendations: [],
        generatedAt: now,
        generatedBy: "system",
      })
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/activations/[id]/reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
