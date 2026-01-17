import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBurnoutScore } from "@/lib/burnout-calculator";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [checkIns, assignments, academicData] = await Promise.all([
      prisma.dailyCheckIn.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "desc" },
      }),
      prisma.assignment.findMany({
        where: { userId },
        orderBy: { dueDate: "asc" },
      }),
      prisma.academicData.findMany({
        where: {
          userId,
          date: { gte: thirtyDaysAgo },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    const burnoutResult = calculateBurnoutScore(checkIns, assignments, academicData);

    // Save the burnout score to the database
    await prisma.burnoutScore.create({
      data: {
        userId,
        score: burnoutResult.score,
        riskLevel: burnoutResult.riskLevel,
        sleepDeficit: burnoutResult.factors.sleepDeficit,
        stressTrend: burnoutResult.factors.stressTrend,
        deadlineDensity: burnoutResult.factors.deadlineDensity,
        attendanceDrop: burnoutResult.factors.attendanceDrop,
        activityChange: burnoutResult.factors.activityChange,
      },
    });

    return NextResponse.json(burnoutResult);
  } catch (error) {
    console.error("Error calculating burnout:", error);
    return NextResponse.json(
      { error: "Failed to calculate burnout score" },
      { status: 500 }
    );
  }
}
