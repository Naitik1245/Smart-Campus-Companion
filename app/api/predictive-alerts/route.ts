import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        dailyCheckIns: { orderBy: { date: "desc" }, take: 14 },
        burnoutScores: { orderBy: { date: "desc" }, take: 4 },
        assignments: {
          where: { completed: false },
          orderBy: { dueDate: "asc" },
        },
        predictiveAlerts: {
          where: { dismissed: false },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new predictions if needed
    const existingAlerts = user.predictiveAlerts;

    if (existingAlerts.length === 0 && user.dailyCheckIns.length >= 7) {
      const predictions = generatePredictions(user);

      for (const pred of predictions) {
        await prisma.predictiveAlert.create({
          data: {
            userId: user.id,
            ...pred,
          },
        });
      }

      // Refetch with new alerts
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          predictiveAlerts: {
            where: { dismissed: false },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return NextResponse.json(updatedUser?.predictiveAlerts || []);
    }

    return NextResponse.json(existingAlerts);
  } catch (error) {
    console.error("Error fetching predictive alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictive alerts" },
      { status: 500 }
    );
  }
}

function generatePredictions(user: any) {
  const predictions = [];
  const recentCheckIns = user.dailyCheckIns.slice(0, 7);
  const olderCheckIns = user.dailyCheckIns.slice(7, 14);

  // Calculate trends
  const avgRecentSleep = recentCheckIns.reduce((sum: number, c: any) => sum + c.sleepHours, 0) / recentCheckIns.length;
  const avgOlderSleep = olderCheckIns.length > 0
    ? olderCheckIns.reduce((sum: number, c: any) => sum + c.sleepHours, 0) / olderCheckIns.length
    : avgRecentSleep;

  const avgRecentStress = recentCheckIns.reduce((sum: number, c: any) => sum + c.stressLevel, 0) / recentCheckIns.length;
  const avgRecentMood = recentCheckIns.reduce((sum: number, c: any) => sum + c.mood, 0) / recentCheckIns.length;

  // Prediction 1: Sleep Crisis
  if (avgRecentSleep < avgOlderSleep - 1 && avgRecentSleep < 6) {
    predictions.push({
      alertType: "SLEEP_CRISIS",
      severity: avgRecentSleep < 5 ? "CRITICAL" : "HIGH",
      prediction: "Based on your declining sleep pattern, you're at risk of sleep deprivation by next week",
      recommendation: "Prioritize 7-8 hours of sleep tonight. Set a bedtime alarm and avoid screens 30 min before bed.",
      daysAhead: 3,
    });
  }

  // Prediction 2: Burnout Warning
  const recentBurnout = user.burnoutScores[0];
  if (recentBurnout && recentBurnout.score > 60) {
    predictions.push({
      alertType: "BURNOUT_WARNING",
      severity: recentBurnout.score > 75 ? "CRITICAL" : "HIGH",
      prediction: "Your burnout score trend suggests you may hit critical levels within 5-7 days",
      recommendation: "Book a counselor session NOW. Take a mental health day if possible. Practice daily self-care.",
      daysAhead: 5,
    });
  }

  // Prediction 3: Stress Spike
  if (avgRecentStress > 7) {
    const upcomingAssignments = user.assignments.filter((a: any) => {
      const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil > 0;
    });

    if (upcomingAssignments.length >= 3) {
      predictions.push({
        alertType: "STRESS_SPIKE",
        severity: "HIGH",
        prediction: `You have ${upcomingAssignments.length} deadlines in the next week. Stress will likely intensify.`,
        recommendation: "Use the Pomodoro technique. Break tasks into smaller chunks. Don't wait until the last minute!",
        daysAhead: 2,
      });
    }
  }

  // Prediction 4: Mood Decline
  if (avgRecentMood < 5 && avgRecentMood < avgRecentStress) {
    predictions.push({
      alertType: "BURNOUT_WARNING",
      severity: "MEDIUM",
      prediction: "Your mood has been low recently. This could affect your academic performance.",
      recommendation: "Try the breathing exercises. Connect with friends. Consider talking to a counselor.",
      daysAhead: 4,
    });
  }

  return predictions;
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alertId } = await req.json();

    await prisma.predictiveAlert.update({
      where: { id: alertId },
      data: { dismissed: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing alert:", error);
    return NextResponse.json(
      { error: "Failed to dismiss alert" },
      { status: 500 }
    );
  }
}
