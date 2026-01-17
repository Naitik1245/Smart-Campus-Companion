import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const { mood, sleepHours, stressLevel, energyLevel, notes } = body;

    // Check if there's already a check-in for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.dailyCheckIn.findFirst({
      where: {
        userId,
        date: {
          gte: today,
        },
      },
    });

    let checkIn;

    if (existingCheckIn) {
      // Update existing check-in
      checkIn = await prisma.dailyCheckIn.update({
        where: { id: existingCheckIn.id },
        data: {
          mood,
          sleepHours,
          stressLevel,
          energyLevel,
          notes,
        },
      });
    } else {
      // Create new check-in
      checkIn = await prisma.dailyCheckIn.create({
        data: {
          userId,
          mood,
          sleepHours,
          stressLevel,
          energyLevel,
          notes,
          date: new Date(),
        },
      });
    }

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error("Error saving check-in:", error);
    return NextResponse.json(
      { error: "Failed to save check-in" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const checkIns = await prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    return NextResponse.json(checkIns);
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}
