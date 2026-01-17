"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Sparkles, Shield, Zap, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6" />
              <span className="text-xl font-bold tracking-tight">Campus</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:text-white/80">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-white text-black hover:bg-white/90">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm">AI-Powered Wellness Platform</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your Mental Health
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Matters
            </span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Predict burnout before it happens. Track wellness in real-time.
            Get AI-powered support 24/7.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 group h-14 px-8 text-lg">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-lg"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </motion.div>

          <motion.div
            className="mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <ChevronDown className="h-6 w-6 mx-auto animate-bounce text-white/40" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "99%", label: "Accuracy" },
              { value: "7-Day", label: "Prediction" },
              { value: "24/7", label: "AI Support" },
              { value: "100%", label: "Private" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Professional-grade tools designed for student wellness
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Wellness Coach",
                description: "Chat with an AI that understands your struggles. Get personalized advice based on your data.",
              },
              {
                icon: Zap,
                title: "Predictive Alerts",
                description: "Know about burnout 7 days before it hits. Take action early, stay healthy.",
              },
              {
                icon: Shield,
                title: "Emergency SOS",
                description: "One-click access to crisis support. Campus security, counselors, instant help.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="h-12 w-12 mb-6 text-purple-400" />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 px-6 bg-white/5">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <blockquote className="text-3xl md:text-4xl font-light mb-8 leading-relaxed">
              "This platform{" "}
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                saved my semester
              </span>
              . I caught burnout early and got help before it was too late."
            </blockquote>
            <div className="text-white/60">
              <div className="font-semibold text-white">Sarah Chen</div>
              <div className="text-sm">Computer Science, Class of 2025</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 md:p-20 text-center overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                Ready to Start?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join students who are taking control of their mental health
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-black hover:bg-white/90 h-14 px-10 text-lg font-semibold">
                  Create Free Account
                </Button>
              </Link>
              <p className="text-sm text-white/70 mt-6">No credit card required • Set up in 2 minutes</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span className="font-bold">Smart Campus Companion</span>
            </div>
            <div className="text-white/60 text-sm">
              © 2026 Built with Next.js, Prisma, and AI
            </div>
            <div className="flex gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
