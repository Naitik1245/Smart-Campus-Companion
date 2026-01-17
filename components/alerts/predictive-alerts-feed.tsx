"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PredictiveAlert {
  id: string;
  alertType: string;
  severity: string;
  prediction: string;
  recommendation: string;
  daysAhead: number;
  dismissed: boolean;
  createdAt: string;
}

export function PredictiveAlertsFeed() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const response = await fetch("/api/predictive-alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Error fetching predictive alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function dismissAlert(alertId: string) {
    try {
      const response = await fetch("/api/predictive-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (response.ok) {
        setAlerts(alerts.filter((a) => a.id !== alertId));
      }
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800";
      case "HIGH":
        return "bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800";
      case "MEDIUM":
        return "bg-yellow-100 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800";
      default:
        return "bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800";
    }
  }

  function getSeverityBadge(severity: string) {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">Critical</Badge>;
      case "HIGH":
        return <Badge className="bg-orange-500">High</Badge>;
      case "MEDIUM":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  }

  function getAlertIcon(alertType: string) {
    switch (alertType) {
      case "BURNOUT_WARNING":
        return "🔥";
      case "SLEEP_CRISIS":
        return "😴";
      case "STRESS_SPIKE":
        return "⚡";
      default:
        return "⚠️";
    }
  }

  function getAlertTitle(alertType: string) {
    switch (alertType) {
      case "BURNOUT_WARNING":
        return "Burnout Warning";
      case "SLEEP_CRISIS":
        return "Sleep Crisis Alert";
      case "STRESS_SPIKE":
        return "Stress Spike Detected";
      default:
        return "Wellness Alert";
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Predictive Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading predictions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Predictive Alerts
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold">No alerts right now! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your wellness trends look healthy. Keep it up!
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border-2 relative ${getSeverityColor(alert.severity)}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="pr-8">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-2xl">{getAlertIcon(alert.alertType)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">
                        {getAlertTitle(alert.alertType)}
                      </h4>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Predicted {alert.daysAhead} days ahead
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-3">
                  <div>
                    <p className="text-sm font-medium">📊 Prediction:</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {alert.prediction}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">💡 Recommendation:</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {alert.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg text-xs">
          <p className="font-semibold text-purple-700 dark:text-purple-300">
            🤖 AI-Powered Predictions
          </p>
          <p className="text-purple-600 dark:text-purple-400 mt-1">
            These alerts analyze your wellness patterns to predict potential issues before they
            happen. Act on them early to stay healthy!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
