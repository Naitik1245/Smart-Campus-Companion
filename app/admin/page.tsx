"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navbar } from "@/components/layout/navbar";
import { Users, AlertTriangle, TrendingUp, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRiskBadgeVariant } from "@/lib/burnout-calculator";

interface StudentRiskData {
  id: string;
  name: string;
  email: string;
  burnoutScore: number;
  riskLevel: string;
  lastCheckIn: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<StudentRiskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    moderate: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      const userRole = (session.user as any)?.role;
      if (userRole !== "MENTOR" && userRole !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchStudentData();
    }
  }, [status, session, router]);

  async function fetchStudentData() {
    try {
      const response = await fetch("/api/admin/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full max-w-[1400px] mx-auto py-8 px-6 md:px-8 lg:px-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Risk Overview</h1>
          <p className="text-muted-foreground">
            Monitor students at high risk of burnout (privacy-first approach)
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moderate Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.moderate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Student Table */}
        <Card>
          <CardHeader>
            <CardTitle>High-Risk Students</CardTitle>
            <CardDescription>
              Students flagged with moderate to critical burnout risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Only students who have consented to share data with mentors are shown
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Burnout Score</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Last Check-in</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-bold">{student.burnoutScore}</div>
                          <div className="text-xs text-muted-foreground">/100</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskBadgeVariant(student.riskLevel)}>
                          {student.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.lastCheckIn
                          ? new Date(student.lastCheckIn).toLocaleDateString()
                          : "No data"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Contact
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No high-risk students at this time
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
