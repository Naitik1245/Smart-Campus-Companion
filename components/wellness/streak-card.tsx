"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";

export function StreakCard() {
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  async function fetchStreak() {
    try {
      const response = await fetch("/api/wellness-streak");
      if (response.ok) {
        const data = await response.json();
        setStreak(data);
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Wellness Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
          <Flame className="h-5 w-5" />
          Wellness Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {streak?.currentStreak || 0} days
            </p>
            <p className="text-sm text-muted-foreground">Current streak</p>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {streak?.longestStreak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Best</p>
            </div>
          </div>
        </div>

        {streak?.currentStreak === 0 && (
          <p className="text-sm text-muted-foreground">
            Start your wellness journey today! Complete a check-in to begin your streak.
          </p>
        )}

        {streak?.currentStreak > 0 && streak?.currentStreak < 7 && (
          <p className="text-sm text-muted-foreground">
            Keep it up! {7 - streak.currentStreak} more days to earn the Week Warrior badge! 🔥
          </p>
        )}

        {streak?.currentStreak >= 7 && (
          <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
            Amazing! You're on a roll! Keep the momentum going! 🎉
          </p>
        )}
      </CardContent>
    </Card>
  );
}
