import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import { SimulationAttempt } from "@/models/SimulationAttempt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, reason } = body;

    if (!attemptId || !reason) {
      return NextResponse.json({ error: "attemptId and reason are required" }, { status: 400 });
    }

    if (attemptId.startsWith("demo_") || attemptId.startsWith("local_")) {
      return NextResponse.json({
        success: true,
        localMode: true,
      });
    }

    await connectWithTimeout(3000);
    const attempt = await SimulationAttempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Increment warning count and record the event
    attempt.warningCount = (attempt.warningCount || 0) + 1;
    if (!attempt.warningEvents) {
      attempt.warningEvents = [];
    }
    attempt.warningEvents.push({
      timestamp: new Date(),
      reason,
    });

    // Auto-termination on the 5th violation
    if (attempt.warningCount >= 5) {
      attempt.status = "TERMINATED";
      attempt.completedAt = new Date();
    }

    await attempt.save();

    return NextResponse.json({
      success: true,
      warningCount: attempt.warningCount,
      status: attempt.status,
    });
  } catch (error) {
    console.error("Error logging violation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
