"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/navbar";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";

const bookingSchema = z.object({
  sessionType: z.enum(["ACADEMIC", "PERSONAL", "CAREER"]),
  date: z.date(),
  time: z.string(),
  anonymous: z.boolean(),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const availableTimeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

export default function CounselorBookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      sessionType: "PERSONAL",
      anonymous: false,
      notes: "",
    },
  });

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/counselor-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to book session");
      }

      toast.success("Counselor session booked successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error booking session:", error);
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="w-full max-w-[1400px] mx-auto py-8 px-6 md:px-8 lg:px-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Book a Counselor Session</h1>
          <p className="text-muted-foreground">Schedule a confidential session with a professional counselor</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>
              All sessions are confidential and designed to support your wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Session Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 gap-4"
                        >
                          <div className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value="ACADEMIC" />
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none cursor-pointer">
                                Academic Counseling
                              </label>
                              <p className="text-sm text-muted-foreground">
                                Support with academic challenges, study strategies, and course planning
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value="PERSONAL" />
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none cursor-pointer">
                                Personal Counseling
                              </label>
                              <p className="text-sm text-muted-foreground">
                                Support with stress, anxiety, mental health, and personal challenges
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                            <RadioGroupItem value="CAREER" />
                            <div className="space-y-1">
                              <label className="text-sm font-medium leading-none cursor-pointer">
                                Career Counseling
                              </label>
                              <p className="text-sm text-muted-foreground">
                                Guidance on career paths, internships, and professional development
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Date</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                        className="rounded-md border"
                      />
                      <FormDescription>
                        Sessions are available Monday through Friday
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTimeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="anonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Anonymous Booking</FormLabel>
                        <FormDescription>
                          Your identity will not be shared with the counselor until the session
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific topics or concerns you'd like to discuss..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This information helps the counselor prepare for your session
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
