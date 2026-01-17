"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timer, setTimer] = useState(4);
  const [totalTime, setTotalTime] = useState(0);

  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 6,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Move to next phase
            if (phase === "inhale") {
              setPhase("hold");
              return phaseDurations.hold;
            } else if (phase === "hold") {
              setPhase("exhale");
              return phaseDurations.exhale;
            } else {
              setPhase("inhale");
              return phaseDurations.inhale;
            }
          }
          return prev - 1;
        });

        setTotalTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("inhale");
    setTimer(phaseDurations.inhale);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = async () => {
    setIsActive(false);
    setPhase("inhale");
    setTimer(phaseDurations.inhale);

    // Save completed activity if user did at least 1 minute
    if (totalTime >= 60) {
      try {
        await fetch("/api/wellness-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "BREATHING",
            duration: totalTime,
            completed: true,
          }),
        });
        toast.success(`Great job! ${Math.floor(totalTime / 60)} minute breathing exercise completed! 🧘`);
      } catch (error) {
        console.error("Error saving activity:", error);
      }
    }

    setTotalTime(0);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "from-blue-500 to-cyan-500";
      case "hold":
        return "from-purple-500 to-pink-500";
      case "exhale":
        return "from-green-500 to-emerald-500";
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return "Breathe In";
      case "hold":
        return "Hold";
      case "exhale":
        return "Breathe Out";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-blue-500" />
          Breathing Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          {/* Animated Circle */}
          <div className="relative w-48 h-48 mx-auto">
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-20 blur-xl transition-all duration-1000 ${
                isActive ? "scale-110" : "scale-100"
              }`}
            />
            <div
              className={`absolute inset-4 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center transition-all duration-1000 ${
                phase === "inhale" && isActive
                  ? "scale-110"
                  : phase === "exhale" && isActive
                  ? "scale-90"
                  : "scale-100"
              }`}
            >
              <div className="text-white text-center">
                <div className="text-5xl font-bold">{timer}</div>
                <div className="text-sm font-medium mt-1">{getPhaseText()}</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground">
            {!isActive
              ? "Click Start to begin the 4-4-6 breathing technique"
              : `Total time: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`}
          </p>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isActive ? (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Benefits:</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Reduces stress and anxiety</li>
            <li>• Improves focus and concentration</li>
            <li>• Calms the nervous system</li>
            <li>• Enhances emotional regulation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
