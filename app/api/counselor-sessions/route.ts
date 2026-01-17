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

    const counselorSession = await prisma.counselorSession.create({
      data: {
        userId,
        sessionType: body.sessionType,
        date: new Date(body.date),
        time: body.time,
        anonymous: body.anonymous || false,
        notes: body.notes,
        status: "PENDING",
      },
    });

    return NextResponse.json(counselorSession);
  } catch (error) {
    console.error("Error creating counselor session:", error);
    return NextResponse.json(
      { error: "Failed to create counselor session" },
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

    const sessions = await prisma.counselorSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching counselor sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch counselor sessions" },
      { status: 500 }
    );
  }
}
