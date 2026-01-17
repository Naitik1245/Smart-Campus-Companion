"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/navbar";
import {
  Calendar,
  Brain,
  TrendingUp,
  AlertCircle,
  Activity,
  Moon,
  Target
} from "lucide-react";
import { StreakCard } from "@/components/wellness/streak-card";
import { AchievementsShowcase } from "@/components/wellness/achievements-showcase";
import { BreathingExercise } from "@/components/wellness/breathing-exercise";
import { MoodInsights } from "@/components/wellness/mood-insights";
import { WellnessCoachChat } from "@/components/ai/wellness-coach-chat";
import { PomodoroTimer } from "@/components/study/pomodoro-timer";
import { SOSButton } from "@/components/emergency/sos-button";
import { PredictiveAlertsFeed } from "@/components/alerts/predictive-alerts-feed";
import { DailyCheckInDialog } from "@/components/check-in/daily-check-in-dialog";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { UpcomingAppointments } from "@/components/counselor/upcoming-appointments";
import { getRiskColor, getRiskBadgeVariant } from "@/lib/burnout-calculator";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface BurnoutData {
  score: number;
  riskLevel: string;
  factors: {
    sleepDeficit: number;
    stressTrend: number;
    deadlineDensity: number;
    attendanceDrop: number;
    activityChange: number;
  };
}

interface CheckIn {
  id: string;
  date: string;
  mood: number;
  sleepHours: number;
  stressLevel: number;
  energyLevel: number;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  completed: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [burnoutData, setBurnoutData] = useState<BurnoutData | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status]);

  async function fetchDashboardData() {
    try {
      const [burnoutRes, checkInsRes, assignmentsRes] = await Promise.all([
        fetch("/api/burnout"),
        fetch("/api/check-in"),
        fetch("/api/assignments"),
      ]);

      if (burnoutRes.ok) {
        const burnout = await burnoutRes.json();
        setBurnoutData(burnout);
      }

      if (checkInsRes.ok) {
        const checkInsData = await checkInsRes.json();
        setCheckIns(checkInsData);
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json();
        setAssignments(assignmentsData);
      }

      // Increment refresh key to trigger updates in child components
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const upcomingAssignments = assignments
    .filter((a) => !a.completed && new Date(a.dueDate) > new Date())
    .slice(0, 5);

  const chartData = checkIns.slice(0, 7).reverse().map((checkIn) => ({
    date: format(new Date(checkIn.date), "MM/dd"),
    sleep: checkIn.sleepHours,
    stress: checkIn.stressLevel,
    energy: checkIn.energyLevel,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full max-w-[1400px] mx-auto py-8 px-6 md:px-8 lg:px-12 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session?.user?.name}</h1>
            <p className="text-muted-foreground">Here's your wellness overview for today</p>
          </div>
        </div>

        {/* Burnout Score Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Burnout Risk Score
              </CardTitle>
              <CardDescription>Your current wellness assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-5xl font-bold">{burnoutData?.score || 0}</div>
                  <Badge variant={getRiskBadgeVariant(burnoutData?.riskLevel || "LOW")}>
                    {burnoutData?.riskLevel || "LOW"} RISK
                  </Badge>
                </div>
                <Progress value={burnoutData?.score || 0} className="w-32 h-32" />
              </div>
              <p className="text-sm text-muted-foreground">
                {burnoutData?.riskLevel === "CRITICAL" &&
                  "Your burnout risk is critical. Please consider booking a counselor session."}
                {burnoutData?.riskLevel === "HIGH" &&
                  "Your burnout risk is high. Take time to rest and recharge."}
                {burnoutData?.riskLevel === "MODERATE" &&
                  "Your burnout risk is moderate. Stay mindful of your wellness."}
                {burnoutData?.riskLevel === "LOW" &&
                  "You're doing great! Keep maintaining your healthy habits."}
              </p>
            </CardContent>
          </Card>

          {/* Quick Action Cards */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/counselor-booking")}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book Counselor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Schedule a session with a professional</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Daily Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DailyCheckInDialog onSuccess={fetchDashboardData} />
            </CardContent>
          </Card>
        </div>

        {/* Predictive Alerts - Priority Section */}
        <PredictiveAlertsFeed />

        {/* Billion-Dollar Features */}
        <div className="grid gap-6 md:grid-cols-2">
          <WellnessCoachChat />
          <PomodoroTimer />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SOSButton />
          <StreakCard />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MoodInsights refreshKey={refreshKey} />
          <QuickAddTask onTaskAdded={fetchDashboardData} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AchievementsShowcase />
          <UpcomingAppointments />
        </div>

        <BreathingExercise />

        {/* Wellness Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Wellness Trends
            </CardTitle>
            <CardDescription>Your sleep, stress, and energy levels over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sleep"
                    stroke="#8b5cf6"
                    name="Sleep (hours)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    stroke="#ef4444"
                    name="Stress (1-10)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="#10b981"
                    name="Energy (1-10)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Moon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No wellness data yet. Complete your first daily check-in!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Your next assignments and tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAssignments.length > 0 ? (
                upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <Badge variant={assignment.priority === "HIGH" ? "destructive" : "outline"}>
                      {assignment.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <p>No upcoming assignments</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risk Factors Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Risk Factors Breakdown
              </CardTitle>
              <CardDescription>Factors contributing to your burnout risk</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {burnoutData && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sleep Deficit</span>
                      <span className="font-medium">{Math.round(burnoutData.factors.sleepDeficit)}%</span>
                    </div>
                    <Progress value={burnoutData.factors.sleepDeficit} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Stress Trend</span>
                      <span className="font-medium">{Math.round(burnoutData.factors.stressTrend)}%</span>
                    </div>
                    <Progress value={burnoutData.factors.stressTrend} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deadline Density</span>
                      <span className="font-medium">{Math.round(burnoutData.factors.deadlineDensity)}%</span>
                    </div>
                    <Progress value={burnoutData.factors.deadlineDensity} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance Drop</span>
                      <span className="font-medium">{Math.round(burnoutData.factors.attendanceDrop)}%</span>
                    </div>
                    <Progress value={burnoutData.factors.attendanceDrop} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Activity Change</span>
                      <span className="font-medium">{Math.round(burnoutData.factors.activityChange)}%</span>
                    </div>
                    <Progress value={burnoutData.factors.activityChange} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
