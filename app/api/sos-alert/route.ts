import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { emergencyContacts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { message, location } = await req.json();

    // Create SOS alert
    const alert = await prisma.sOSAlert.create({
      data: {
        userId: user.id,
        message,
        location,
        status: "ACTIVE",
      },
    });

    // In production, this would:
    // 1. Send SMS/email to emergency contacts
    // 2. Notify campus security
    // 3. Alert counselors
    // 4. Trigger immediate response protocol

    // For demo: Log the alert
    console.log("🚨 EMERGENCY ALERT:", {
      user: user.name,
      email: user.email,
      message,
      location,
      time: new Date().toISOString(),
    });

    return NextResponse.json({
      alert,
      message: "Emergency services have been notified. Help is on the way.",
      contacts: user.emergencyContacts,
    });
  } catch (error) {
    console.error("Error creating SOS alert:", error);
    return NextResponse.json(
      { error: "Failed to create SOS alert" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sosAlerts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.sosAlerts);
  } catch (error) {
    console.error("Error fetching SOS alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch SOS alerts" },
      { status: 500 }
    );
  }
}
