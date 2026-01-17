import { DailyCheckIn, Assignment, AcademicData } from "@prisma/client";

export interface BurnoutFactors {
  sleepDeficit: number;
  stressTrend: number;
  deadlineDensity: number;
  attendanceDrop: number;
  activityChange: number;
}

export interface BurnoutResult {
  score: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  factors: BurnoutFactors;
}

const IDEAL_SLEEP_HOURS = 7.5;
const WEIGHTS = {
  sleepDeficit: 0.25,
  stressTrend: 0.3,
  deadlineDensity: 0.2,
  attendanceDrop: 0.15,
  activityChange: 0.1,
};

export function calculateBurnoutScore(
  checkIns: DailyCheckIn[],
  assignments: Assignment[],
  academicData: AcademicData[]
): BurnoutResult {
  const factors: BurnoutFactors = {
    sleepDeficit: calculateSleepDeficit(checkIns),
    stressTrend: calculateStressTrend(checkIns),
    deadlineDensity: calculateDeadlineDensity(assignments),
    attendanceDrop: calculateAttendanceDrop(academicData),
    activityChange: calculateActivityChange(checkIns),
  };

  // Calculate weighted score (0-100)
  const score =
    factors.sleepDeficit * WEIGHTS.sleepDeficit +
    factors.stressTrend * WEIGHTS.stressTrend +
    factors.deadlineDensity * WEIGHTS.deadlineDensity +
    factors.attendanceDrop * WEIGHTS.attendanceDrop +
    factors.activityChange * WEIGHTS.activityChange;

  const riskLevel = determineRiskLevel(score);

  return {
    score: Math.round(score),
    riskLevel,
    factors,
  };
}

function calculateSleepDeficit(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const recentCheckIns = checkIns.slice(-7); // Last 7 days
  const avgSleep =
    recentCheckIns.reduce((sum, c) => sum + c.sleepHours, 0) / recentCheckIns.length;

  const deficit = IDEAL_SLEEP_HOURS - avgSleep;
  // Convert deficit to 0-100 scale (3+ hours deficit = 100)
  return Math.min(100, Math.max(0, (deficit / 3) * 100));
}

function calculateStressTrend(checkIns: DailyCheckIn[]): number {
  if (checkIns.length === 0) return 0;

  const recentCheckIns = checkIns.slice(-7);
  const avgStress =
    recentCheckIns.reduce((sum, c) => sum + c.stressLevel, 0) / recentCheckIns.length;

  // Convert 1-10 scale to 0-100
  return (avgStress / 10) * 100;
}

function calculateDeadlineDensity(assignments: Assignment[]): number {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingAssignments = assignments.filter(
    (a) => !a.completed && new Date(a.dueDate) >= now && new Date(a.dueDate) <= nextWeek
  );

  // Cluster factor: more than 5 assignments in a week = high density
  const density = Math.min(100, (upcomingAssignments.length / 5) * 100);

  // Weight by priority
  const priorityBoost = upcomingAssignments.filter((a) => a.priority === "HIGH").length * 10;

  return Math.min(100, density + priorityBoost);
}

function calculateAttendanceDrop(academicData: AcademicData[]): number {
  if (academicData.length < 2) return 0;

  const sorted = [...academicData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const current = sorted[0].attendancePercent;
  const baseline = sorted.slice(1, 4).reduce((sum, d) => sum + d.attendancePercent, 0) / Math.min(3, sorted.length - 1);

  const drop = baseline - current;
  // 20% drop = 100 score
  return Math.min(100, Math.max(0, (drop / 20) * 100));
}

function calculateActivityChange(checkIns: DailyCheckIn[]): number {
  if (checkIns.length < 7) return 0;

  const recentEnergy = checkIns.slice(-3).reduce((sum, c) => sum + c.energyLevel, 0) / 3;
  const baselineEnergy = checkIns.slice(-7, -3).reduce((sum, c) => sum + c.energyLevel, 0) / 4;

  const change = baselineEnergy - recentEnergy;
  // Convert energy drop (1-10 scale) to 0-100
  return Math.min(100, Math.max(0, (change / 5) * 100));
}

function determineRiskLevel(score: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "LOW";
}

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "CRITICAL":
      return "text-red-600";
    case "HIGH":
      return "text-orange-600";
    case "MODERATE":
      return "text-yellow-600";
    case "LOW":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
}

export function getRiskBadgeVariant(
  riskLevel: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (riskLevel) {
    case "CRITICAL":
    case "HIGH":
      return "destructive";
    case "MODERATE":
      return "secondary";
    default:
      return "outline";
  }
}
