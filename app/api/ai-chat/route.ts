import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAQDbticzLL0qM5iNgloIZQno1mlRBX-4Xk");

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        dailyCheckIns: { orderBy: { date: "desc" }, take: 7 },
        burnoutScores: { orderBy: { date: "desc" }, take: 1 },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { message, conversationId } = await req.json();

    // Get or create conversation
    let conversation = conversationId
      ? await prisma.aIConversation.findUnique({ where: { id: conversationId } })
      : null;

    const messages = conversation ? JSON.parse(conversation.messages as string) : [];

    // Build context from user data
    const recentCheckIns = user.dailyCheckIns.slice(0, 3);
    const burnoutScore = user.burnoutScores[0];

    const context = `You are a caring, empathetic AI wellness coach for college students.

User's recent wellness data:
- Current burnout score: ${burnoutScore?.score || "N/A"}/100 (${burnoutScore?.riskLevel || "Unknown"} risk)
- Recent mood average: ${recentCheckIns.length > 0 ? (recentCheckIns.reduce((sum, c) => sum + c.mood, 0) / recentCheckIns.length).toFixed(1) : "N/A"}/10
- Recent sleep average: ${recentCheckIns.length > 0 ? (recentCheckIns.reduce((sum, c) => sum + c.sleepHours, 0) / recentCheckIns.length).toFixed(1) : "N/A"} hours
- Recent stress average: ${recentCheckIns.length > 0 ? (recentCheckIns.reduce((sum, c) => sum + c.stressLevel, 0) / recentCheckIns.length).toFixed(1) : "N/A"}/10

Provide personalized, actionable wellness advice. Be concise (2-3 sentences max). Focus on mental health, stress management, and academic balance.`;

    messages.push({ role: "user", content: message });

    // Call Gemini API
    let aiResponse;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Convert messages to Gemini format
      const chatHistory = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(context + "\n\nUser: " + message);
      aiResponse = result.response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback to smart mock response
      aiResponse = generateMockResponse(message, burnoutScore?.riskLevel, recentCheckIns);
    }

    messages.push({ role: "assistant", content: aiResponse });

    // Save conversation
    try {
      if (conversation) {
        conversation = await prisma.aIConversation.update({
          where: { id: conversation.id },
          data: { messages: JSON.stringify(messages), updatedAt: new Date() },
        });
      } else {
        conversation = await prisma.aIConversation.create({
          data: {
            userId: user.id,
            messages: JSON.stringify(messages),
            topic: "WELLNESS",
          },
        });
      }

      return NextResponse.json({
        message: aiResponse,
        conversationId: conversation.id,
      });
    } catch (saveError) {
      console.error("Error saving conversation:", saveError);
      // Return response even if saving fails
      return NextResponse.json({
        message: aiResponse,
        conversationId: conversationId || null,
      });
    }
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}

function generateMockResponse(userMessage: string, riskLevel?: string, checkIns?: any[]) {
  const msg = userMessage.toLowerCase();

  if (msg.includes("stress") || msg.includes("anxious") || msg.includes("overwhelm")) {
    return "I hear you're feeling stressed. Try the 4-4-6 breathing exercise in your dashboard - it can help calm your nervous system in just 2 minutes. Also, consider breaking your tasks into smaller, manageable chunks. You've got this! 💙";
  }

  if (msg.includes("sleep") || msg.includes("tired") || msg.includes("exhausted")) {
    return "Sleep is crucial for your wellbeing. Try to maintain a consistent sleep schedule, avoid screens 30 minutes before bed, and consider a short wind-down routine. Your body and mind will thank you! 😴";
  }

  if (msg.includes("assignment") || msg.includes("exam") || msg.includes("study")) {
    return "Academic pressure is real! Use the Pomodoro technique - 25 minutes of focused study, then a 5-minute break. This helps prevent burnout while maintaining productivity. Check out the Study Sessions feature! 📚";
  }

  if (riskLevel === "HIGH" || riskLevel === "CRITICAL") {
    return "I noticed your burnout score is elevated. This is important - please consider booking a counselor session. In the meantime, prioritize self-care: get adequate sleep, take breaks, and don't hesitate to ask for help. You're not alone. 💚";
  }

  return "I'm here to support you! Whether it's stress management, study strategies, or just someone to talk to, I'm listening. How can I help you feel better today? 🌟";
}
