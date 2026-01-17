"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MoodInsightsProps {
  refreshKey?: number;
}

export function MoodInsights({ refreshKey }: MoodInsightsProps = {}) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [refreshKey]);

  async function fetchInsights() {
    try {
      const response = await fetch("/api/mood-insights");
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mood Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (insights?.moodTrend) {
      case "IMPROVING":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "DECLINING":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = () => {
    switch (insights?.moodTrend) {
      case "IMPROVING":
        return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20";
      case "DECLINING":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Mood Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Badge */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mood Trend (Last 30 Days)</p>
            <Badge variant="outline" className={`gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              {insights?.moodTrend?.toLowerCase()}
            </Badge>
          </div>
        </div>

        {/* Averages Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Mood</p>
            <p className="text-2xl font-bold">{insights?.avgMood?.toFixed(1)}/10</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Sleep</p>
            <p className="text-2xl font-bold">{insights?.avgSleep?.toFixed(1)}h</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Stress</p>
            <p className="text-2xl font-bold">{insights?.avgStress?.toFixed(1)}/10</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Energy</p>
            <p className="text-2xl font-bold">{insights?.avgEnergy?.toFixed(1)}/10</p>
          </div>
        </div>

        {/* Day Insights */}
        {(insights?.bestDayOfWeek || insights?.worstDayOfWeek) && (
          <div className="space-y-3 pt-4 border-t">
            {insights.bestDayOfWeek && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Best Day</p>
                  <p className="text-xs text-muted-foreground">{insights.bestDayOfWeek}</p>
                </div>
              </div>
            )}
            {insights.worstDayOfWeek && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Challenging Day</p>
                  <p className="text-xs text-muted-foreground">{insights.worstDayOfWeek}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Stressor */}
        {insights?.topStressor && (
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              ⚠️ Top Stressor
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {insights.topStressor}
            </p>
          </div>
        )}

        {/* Insights Message */}
        <div className="text-sm text-muted-foreground">
          {insights?.moodTrend === "IMPROVING" && (
            <p>🎉 Your mood has been improving! Keep up the great work with your wellness routine.</p>
          )}
          {insights?.moodTrend === "DECLINING" && (
            <p>💙 Your mood has been declining. Consider reaching out to a counselor or trying some wellness activities.</p>
          )}
          {insights?.moodTrend === "STABLE" && (
            <p>✨ Your mood has been stable. Maintain your current wellness practices!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
