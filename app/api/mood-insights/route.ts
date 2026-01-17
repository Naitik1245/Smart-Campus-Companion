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
        dailyCheckIns: {
          orderBy: { date: "desc" },
          take: 30,
        },
        moodInsight: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate insights from last 30 days
    const checkIns = user.dailyCheckIns;

    if (checkIns.length === 0) {
      return NextResponse.json({
        avgMood: 0,
        avgSleep: 0,
        avgStress: 0,
        avgEnergy: 0,
        moodTrend: "STABLE",
        topStressor: null,
        bestDayOfWeek: null,
        worstDayOfWeek: null,
      });
    }

    const avgMood = checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length;
    const avgSleep = checkIns.reduce((sum, c) => sum + c.sleepHours, 0) / checkIns.length;
    const avgStress = checkIns.reduce((sum, c) => sum + c.stressLevel, 0) / checkIns.length;
    const avgEnergy = checkIns.reduce((sum, c) => sum + c.energyLevel, 0) / checkIns.length;

    // Determine mood trend
    const recentMood = checkIns.slice(0, 7).reduce((sum, c) => sum + c.mood, 0) / Math.min(7, checkIns.length);
    const olderMood = checkIns.slice(7, 14).reduce((sum, c) => sum + c.mood, 0) / Math.max(1, checkIns.slice(7, 14).length);

    let moodTrend = "STABLE";
    if (recentMood > olderMood + 1) moodTrend = "IMPROVING";
    if (recentMood < olderMood - 1) moodTrend = "DECLINING";

    // Find best/worst day of week
    const dayStats: Record<string, { mood: number; count: number }> = {};
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    checkIns.forEach((checkIn) => {
      const day = days[new Date(checkIn.date).getDay()];
      if (!dayStats[day]) {
        dayStats[day] = { mood: 0, count: 0 };
      }
      dayStats[day].mood += checkIn.mood;
      dayStats[day].count += 1;
    });

    let bestDay = null;
    let worstDay = null;
    let highestAvg = 0;
    let lowestAvg = 10;

    Object.entries(dayStats).forEach(([day, stats]) => {
      const avg = stats.mood / stats.count;
      if (avg > highestAvg) {
        highestAvg = avg;
        bestDay = day;
      }
      if (avg < lowestAvg) {
        lowestAvg = avg;
        worstDay = day;
      }
    });

    // Determine top stressor
    let topStressor = null;
    if (avgStress > 7) topStressor = "High academic pressure";
    else if (avgSleep < 6) topStressor = "Sleep deprivation";
    else if (avgEnergy < 4) topStressor = "Low energy levels";

    const insights = {
      avgMood: Math.round(avgMood * 10) / 10,
      avgSleep: Math.round(avgSleep * 10) / 10,
      avgStress: Math.round(avgStress * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      moodTrend,
      topStressor,
      bestDayOfWeek: bestDay,
      worstDayOfWeek: worstDay,
    };

    // Update or create mood insight record
    if (user.moodInsight) {
      await prisma.moodInsight.update({
        where: { id: user.moodInsight.id },
        data: { ...insights, updatedAt: new Date() },
      });
    } else {
      await prisma.moodInsight.create({
        data: {
          userId: user.id,
          ...insights,
        },
      });
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error fetching mood insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch mood insights" },
      { status: 500 }
    );
  }
}
