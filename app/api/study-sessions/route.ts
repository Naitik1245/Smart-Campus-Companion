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
        studySessions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.studySessions);
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch study sessions" },
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
    const { duration, breaks, completed, focusScore, subject } = body;

    const studySession = await prisma.studySession.create({
      data: {
        userId: user.id,
        duration,
        breaks: breaks || 0,
        completed: completed || false,
        focusScore,
        subject,
        endedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(studySession);
  } catch (error) {
    console.error("Error creating study session:", error);
    return NextResponse.json(
      { error: "Failed to create study session" },
      { status: 500 }
    );
  }
}
