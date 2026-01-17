"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Phone, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SOSButton() {
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSOS() {
    setLoading(true);

    try {
      const response = await fetch("/api/sos-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message || "Emergency - need immediate assistance",
          location: location || "Location not specified",
        }),
      });

      if (!response.ok) throw new Error("Failed to send SOS");

      const data = await response.json();
      toast.success("🚨 Emergency alert sent! Help is on the way.");

      // Reset form
      setMessage("");
      setLocation("");
    } catch (error) {
      console.error("Error sending SOS:", error);
      toast.error("Failed to send emergency alert. Please call 911 directly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <Shield className="h-5 w-5" />
          Emergency SOS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg text-sm">
          <p className="font-semibold text-red-700 dark:text-red-300">
            ⚠️ Use this only in real emergencies
          </p>
          <p className="text-red-600 dark:text-red-400 text-xs mt-1">
            This will notify campus security, emergency contacts, and counseling services.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted p-3 rounded-lg">
            <Phone className="h-4 w-4 text-red-500 mb-1" />
            <div className="font-semibold">National Crisis</div>
            <div className="text-xs text-muted-foreground">988 Suicide & Crisis</div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <Phone className="h-4 w-4 text-red-500 mb-1" />
            <div className="font-semibold">Campus Security</div>
            <div className="text-xs text-muted-foreground">Emergency Line</div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2" size="lg">
              <AlertCircle className="h-5 w-5" />
              Send Emergency Alert
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Send Emergency SOS?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This will immediately notify campus security, your emergency contacts,
                  and counseling services.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Brief message (optional)
                    </label>
                    <Textarea
                      placeholder="e.g., Feeling overwhelmed, need to talk to someone"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Your location (optional)
                    </label>
                    <Input
                      placeholder="e.g., Library 3rd floor, Dorm Room 204"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1"
                      icon={<MapPin className="h-4 w-4" />}
                    />
                  </div>
                </div>

                <p className="text-xs">
                  <strong>If this is a medical emergency, please call 911 immediately.</strong>
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSOS}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Sending..." : "Send Emergency Alert"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="text-xs text-center text-muted-foreground">
          <p>💙 You are not alone. Help is available 24/7.</p>
        </div>
      </CardContent>
    </Card>
  );
}
