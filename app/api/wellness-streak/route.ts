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
      include: { wellnessStreak: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no streak record exists, create one
    if (!user.wellnessStreak) {
      const newStreak = await prisma.wellnessStreak.create({
        data: {
          userId: user.id,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
      return NextResponse.json(newStreak);
    }

    return NextResponse.json(user.wellnessStreak);
  } catch (error) {
    console.error("Error fetching wellness streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch wellness streak" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wellnessStreak: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create streak
    let streak = user.wellnessStreak;
    if (!streak) {
      streak = await prisma.wellnessStreak.create({
        data: {
          userId: user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastCheckIn: new Date(),
        },
      });
    } else {
      const lastCheckIn = streak.lastCheckIn ? new Date(streak.lastCheckIn) : null;

      if (lastCheckIn) {
        lastCheckIn.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Already checked in today
          return NextResponse.json(streak);
        } else if (daysDiff === 1) {
          // Consecutive day - increment streak
          const newStreak = streak.currentStreak + 1;
          streak = await prisma.wellnessStreak.update({
            where: { id: streak.id },
            data: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, streak.longestStreak),
              lastCheckIn: new Date(),
            },
          });
        } else {
          // Streak broken - reset
          streak = await prisma.wellnessStreak.update({
            where: { id: streak.id },
            data: {
              currentStreak: 1,
              lastCheckIn: new Date(),
            },
          });
        }
      } else {
        // First check-in
        streak = await prisma.wellnessStreak.update({
          where: { id: streak.id },
          data: {
            currentStreak: 1,
            lastCheckIn: new Date(),
          },
        });
      }
    }

    // Check for achievements
    await checkAndAwardAchievements(user.id, streak.currentStreak);

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Error updating wellness streak:", error);
    return NextResponse.json(
      { error: "Failed to update wellness streak" },
      { status: 500 }
    );
  }
}

async function checkAndAwardAchievements(userId: string, streakDays: number) {
  const achievements = [];

  if (streakDays === 7) {
    achievements.push({
      type: "WEEK_WARRIOR",
      title: "Week Warrior",
      description: "Completed 7 consecutive days of check-ins!",
      icon: "🔥",
    });
  }

  if (streakDays === 30) {
    achievements.push({
      type: "MONTH_MASTER",
      title: "Month Master",
      description: "Completed 30 consecutive days of check-ins!",
      icon: "🏆",
    });
  }

  if (streakDays === 100) {
    achievements.push({
      type: "WELLNESS_GURU",
      title: "Wellness Guru",
      description: "Completed 100 consecutive days of check-ins!",
      icon: "👑",
    });
  }

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: {
        userId,
        type: achievement.type as any,
      },
    });

    if (!existing) {
      await prisma.achievement.create({
        data: {
          userId,
          ...achievement,
        },
      });
    }
  }
}
