"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { toast } from "sonner";

export function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [subject, setSubject] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  async function handleTimerComplete() {
    setIsActive(false);

    if (!isBreak) {
      // Pomodoro complete
      setCompletedSessions(completedSessions + 1);
      toast.success("🎉 Pomodoro complete! Time for a break!");

      // Save study session
      try {
        await fetch("/api/study-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            duration: 25 * 60,
            breaks: 0,
            completed: true,
            focusScore: 85 + Math.floor(Math.random() * 15), // 85-100
            subject: subject || "General Study",
          }),
        });
      } catch (error) {
        console.error("Error saving session:", error);
      }

      // Start break
      setIsBreak(true);
      setMinutes(5);
      setSeconds(0);
    } else {
      // Break complete
      toast.success("Break's over! Ready for another session?");
      setIsBreak(false);
      setMinutes(25);
      setSeconds(0);
    }
  }

  function start() {
    setIsActive(true);
  }

  function pause() {
    setIsActive(false);
  }

  function reset() {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  }

  const progress = isBreak
    ? ((5 * 60 - (minutes * 60 + seconds)) / (5 * 60)) * 100
    : ((25 * 60 - (minutes * 60 + seconds)) / (25 * 60)) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Pomodoro Study Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="relative w-48 h-48 mx-auto">
            {/* Progress Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className={isBreak ? "text-green-500" : "text-blue-500"}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>

            {/* Time */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-bold">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {isBreak ? (
                  <span className="flex items-center gap-1">
                    <Coffee className="h-3 w-3" />
                    Break Time
                  </span>
                ) : (
                  "Focus Time"
                )}
              </div>
            </div>
          </div>

          {/* Subject Input */}
          {!isActive && !isBreak && (
            <Input
              placeholder="What are you studying?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="max-w-xs mx-auto"
            />
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <div className="font-bold text-lg">{completedSessions}</div>
              <div className="text-muted-foreground">Sessions</div>
            </div>
            <div>
              <div className="font-bold text-lg">{completedSessions * 25}</div>
              <div className="text-muted-foreground">Minutes</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            {!isActive ? (
              <Button onClick={start} className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={pause} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            <Button onClick={reset} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-sm">
          <p className="font-semibold text-blue-700 dark:text-blue-300">💡 Pomodoro Tips:</p>
          <ul className="mt-1 space-y-1 text-blue-600 dark:text-blue-400 text-xs">
            <li>• Work for 25 minutes with full focus</li>
            <li>• Take a 5-minute break (move, stretch, hydrate)</li>
            <li>• After 4 sessions, take a longer 15-30 min break</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
