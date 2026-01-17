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

    const userRole = (session.user as any)?.role;

    // Only mentors and admins can access this endpoint
    if (userRole !== "MENTOR" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all students with their latest burnout scores
    // Only include students who have consented to share data with mentors
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        privacySettings: {
          shareWithMentors: true,
        },
      },
      include: {
        burnoutScores: {
          orderBy: { date: "desc" },
          take: 1,
        },
        dailyCheckIns: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
    });

    // Filter students with moderate to critical risk levels
    const highRiskStudents = students
      .filter((student: typeof students[number]) => {
        const latestScore = student.burnoutScores[0];
        return (
          latestScore &&
          (latestScore.riskLevel === "MODERATE" ||
            latestScore.riskLevel === "HIGH" ||
            latestScore.riskLevel === "CRITICAL")
        );
      })
      .map((student: typeof students[number]) => ({
        id: student.id,
        name: student.name || "Anonymous",
        email: student.email,
        burnoutScore: student.burnoutScores[0]?.score || 0,
        riskLevel: student.burnoutScores[0]?.riskLevel || "LOW",
        lastCheckIn: student.dailyCheckIns[0]?.date || null,
      }))
      .sort((a: any, b: any) => b.burnoutScore - a.burnoutScore); // Sort by highest risk first

    // Calculate statistics
    const stats = {
      total: students.length,
      critical: highRiskStudents.filter((s: any) => s.riskLevel === "CRITICAL").length,
      high: highRiskStudents.filter((s: any) => s.riskLevel === "HIGH").length,
      moderate: highRiskStudents.filter((s: any) => s.riskLevel === "MODERATE").length,
    };

    return NextResponse.json({
      students: highRiskStudents,
      stats,
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}
