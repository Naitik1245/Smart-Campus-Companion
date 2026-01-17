import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "demo-key",
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Fetch user's burnout data
    const [latestBurnout, checkIns, assignments] = await Promise.all([
      prisma.burnoutScore.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
      }),
      prisma.dailyCheckIn.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 7,
      }),
      prisma.assignment.findMany({
        where: { userId, completed: false },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    if (!latestBurnout) {
      return NextResponse.json(
        { error: "No burnout data available" },
        { status: 400 }
      );
    }

    // Generate AI recommendations
    const recommendations = await generateRecommendations(
      latestBurnout,
      checkIns,
      assignments
    );

    // Save recommendations to database
    const savedRecommendations = await Promise.all(
      recommendations.map((rec) =>
        prisma.recommendation.create({
          data: {
            userId,
            type: rec.type,
            title: rec.title,
            description: rec.description,
          },
        })
      )
    );

    return NextResponse.json(savedRecommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

async function generateRecommendations(
  burnoutScore: any,
  checkIns: any[],
  assignments: any[]
): Promise<
  Array<{
    type: "REST_PLAN" | "STUDY_PACING" | "BREAK_REMINDER" | "WELLNESS_TIP" | "ACTIVITY_SUGGESTION";
    title: string;
    description: string;
  }>
> {
  const recommendations: any[] = [];

  // Rule-based recommendations (fallback if OpenAI is not available)
  if (burnoutScore.sleepDeficit > 50) {
    recommendations.push({
      type: "REST_PLAN",
      title: "Prioritize Sleep Tonight",
      description:
        "Your sleep deficit is elevated. Aim for at least 7-8 hours tonight. Set a bedtime alarm and avoid screens 1 hour before bed.",
    });
  }

  if (burnoutScore.stressTrend > 70) {
    recommendations.push({
      type: "WELLNESS_TIP",
      title: "Try the 5-4-3-2-1 Grounding Technique",
      description:
        "When feeling stressed, identify 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. This helps reduce anxiety.",
    });
  }

  if (burnoutScore.deadlineDensity > 60) {
    recommendations.push({
      type: "STUDY_PACING",
      title: "Break Down Large Assignments",
      description:
        "You have multiple deadlines coming up. Break each assignment into smaller tasks and tackle them across multiple days instead of cramming.",
    });
  }

  if (checkIns.length > 0 && checkIns[0].energyLevel < 4) {
    recommendations.push({
      type: "ACTIVITY_SUGGESTION",
      title: "Take a 10-Minute Walk",
      description:
        "Low energy detected. A short walk outdoors can boost your energy and improve focus. Even 10 minutes makes a difference!",
    });
  }

  recommendations.push({
    type: "BREAK_REMINDER",
    title: "Use the Pomodoro Technique",
    description:
      "Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break. This prevents burnout while studying.",
  });

  // Try to use OpenAI for more personalized recommendations
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "demo-key") {
    try {
      const prompt = `As a wellness advisor for students, generate 2 personalized recommendations based on this data:

Burnout Score: ${burnoutScore.score}/100 (${burnoutScore.riskLevel} risk)
Sleep Deficit: ${burnoutScore.sleepDeficit}%
Stress Trend: ${burnoutScore.stressTrend}%
Upcoming Deadlines: ${assignments.length}

Recent mood/energy levels: ${checkIns.map((c) => `Mood: ${c.mood}, Energy: ${c.energyLevel}`).join("; ")}

Generate 2 specific, actionable wellness recommendations. Format as JSON array:
[{
  "type": "WELLNESS_TIP" | "REST_PLAN" | "STUDY_PACING" | "ACTIVITY_SUGGESTION",
  "title": "short title",
  "description": "detailed recommendation"
}]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiRecommendations = JSON.parse(
        completion.choices[0].message.content || "[]"
      );

      recommendations.push(...aiRecommendations);
    } catch (error) {
      console.error("OpenAI error, using rule-based recommendations:", error);
    }
  }

  return recommendations.slice(0, 5); // Return top 5 recommendations
}
