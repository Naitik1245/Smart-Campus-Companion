"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface CounselorSession {
  id: string;
  sessionType: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

export function UpcomingAppointments() {
  const [sessions, setSessions] = useState<CounselorSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const response = await fetch("/api/counselor-sessions");
      if (response.ok) {
        const data = await response.json();
        // Filter for upcoming sessions
        const upcoming = data.filter((session: CounselorSession) => {
          return new Date(session.date) > new Date() && session.status !== "COMPLETED";
        });
        setSessions(upcoming);
      }
    } catch (error) {
      console.error("Error fetching counselor sessions:", error);
    } finally {
      setLoading(false);
    }
  }

  function getSessionTypeColor(type: string) {
    switch (type) {
      case "CRISIS":
        return "bg-red-500";
      case "ACADEMIC_STRESS":
        return "bg-orange-500";
      case "MENTAL_HEALTH":
        return "bg-purple-500";
      case "WELLNESS_CHECKUP":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  }

  function getSessionTypeLabel(type: string) {
    switch (type) {
      case "CRISIS":
        return "Crisis";
      case "ACADEMIC_STRESS":
        return "Academic Stress";
      case "MENTAL_HEALTH":
        return "Mental Health";
      case "WELLNESS_CHECKUP":
        return "Wellness Checkup";
      case "CAREER_GUIDANCE":
        return "Career Guidance";
      default:
        return type;
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Upcoming Appointments
          {sessions.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {sessions.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            <p className="text-xs text-muted-foreground mt-1">
              Book a session if you need support
            </p>
          </div>
        ) : (
          sessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Badge className={getSessionTypeColor(session.sessionType)}>
                    {getSessionTypeLabel(session.sessionType)}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {session.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(session.date), "MMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {session.time}
                </div>
              </div>

              {session.notes && (
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  {session.notes}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
