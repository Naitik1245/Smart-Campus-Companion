"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/layout/navbar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Bell, Download, Trash2 } from "lucide-react";
import { DailyCheckInDialog } from "@/components/check-in/daily-check-in-dialog";
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

interface PrivacySettings {
  shareWithMentors: boolean;
  shareAcademicData: boolean;
  shareWellnessData: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>({
    shareWithMentors: true,
    shareAcademicData: true,
    shareWellnessData: false,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  async function fetchSettings() {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateSettings(newSettings: Partial<PrivacySettings>) {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...newSettings }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      setSettings({ ...settings, ...newSettings });
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    try {
      const response = await fetch("/api/export-data");
      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wellness-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  }

  async function deleteAllData() {
    try {
      const response = await fetch("/api/delete-data", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete data");

      toast.success("All data deleted successfully");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete data");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8 px-4">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-64 bg-muted animate-pulse rounded" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full max-w-[1400px] mx-auto py-8 px-6 md:px-8 lg:px-12 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your privacy and notification preferences</p>
          </div>
          <DailyCheckInDialog />
        </div>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy & Data Sharing
            </CardTitle>
            <CardDescription>
              Control what information is visible to mentors and administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-mentors">Share with Mentors</Label>
                <p className="text-sm text-muted-foreground">
                  Allow mentors to see your burnout risk score when it's elevated
                </p>
              </div>
              <Switch
                id="share-mentors"
                checked={settings.shareWithMentors}
                onCheckedChange={(checked) => updateSettings({ shareWithMentors: checked })}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-academic">Share Academic Data</Label>
                <p className="text-sm text-muted-foreground">
                  Include attendance and assignment data in burnout calculations
                </p>
              </div>
              <Switch
                id="share-academic"
                checked={settings.shareAcademicData}
                onCheckedChange={(checked) => updateSettings({ shareAcademicData: checked })}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-wellness">Share Wellness Data</Label>
                <p className="text-sm text-muted-foreground">
                  Share detailed wellness check-in data (sleep, stress, mood) with counselors
                </p>
              </div>
              <Switch
                id="share-wellness"
                checked={settings.shareWellnessData}
                onCheckedChange={(checked) => updateSettings({ shareWellnessData: checked })}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure how you receive updates and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notif">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive wellness tips and appointment reminders via email
                </p>
              </div>
              <Switch
                id="email-notif"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                disabled={saving}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notif">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get real-time reminders for check-ins and breaks
                </p>
              </div>
              <Switch
                id="push-notif"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or delete your personal data (GDPR compliance)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground">
                  Download all your wellness data in JSON format
                </p>
              </div>
              <Button variant="outline" onClick={exportData} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete All Data</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your wellness data and account information
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your wellness
                      data, check-ins, assignments, and account information from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAllData} className="bg-destructive text-destructive-foreground">
                      Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
