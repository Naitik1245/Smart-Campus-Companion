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
        wellnessActivities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.wellnessActivities);
  } catch (error) {
    console.error("Error fetching wellness activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch wellness activities" },
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
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { type, duration, completed } = body;

    const activity = await prisma.wellnessActivity.create({
      data: {
        userId: user.id,
        type,
        duration,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error creating wellness activity:", error);
    return NextResponse.json(
      { error: "Failed to create wellness activity" },
      { status: 500 }
    );
  }
}
