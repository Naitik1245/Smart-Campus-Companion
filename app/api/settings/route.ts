import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    let settings = await prisma.privacySettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.privacySettings.create({
        data: {
          userId,
          shareWithMentors: true,
          shareAcademicData: true,
          shareWellnessData: false,
          emailNotifications: true,
          pushNotifications: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const settings = await prisma.privacySettings.upsert({
      where: { userId },
      update: {
        shareWithMentors: body.shareWithMentors,
        shareAcademicData: body.shareAcademicData,
        shareWellnessData: body.shareWellnessData,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
      },
      create: {
        userId,
        shareWithMentors: body.shareWithMentors,
        shareAcademicData: body.shareAcademicData,
        shareWellnessData: body.shareWellnessData,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
