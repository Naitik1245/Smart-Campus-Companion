import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, TrendingUp, Shield, Calendar, Activity, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Brain className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Smart Campus Companion
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered platform to predict, prevent, and support student burnout
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How We Support You</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to monitor, analyze, and improve student wellbeing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Burnout Prediction</CardTitle>
              <CardDescription>
                Advanced AI algorithm tracks sleep, stress, and academic load to predict burnout risk
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Daily Check-ins</CardTitle>
              <CardDescription>
                Simple wellness tracking to monitor mood, energy, and stress levels over time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Personalized wellness tips and rest plans based on your unique patterns
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Counselor Booking</CardTitle>
              <CardDescription>
                Easy scheduling for academic, personal, or career counseling sessions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mentor Support</CardTitle>
              <CardDescription>
                Privacy-first approach allowing mentors to support high-risk students
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                Full control over data sharing with GDPR-compliant privacy settings
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl">Ready to Take Control of Your Wellbeing?</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands of students using Smart Campus Companion to stay healthy and succeed
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2026 Smart Campus Companion. Built with Next.js, Prisma, and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
