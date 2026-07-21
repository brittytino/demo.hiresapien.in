import { NextRequest, NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import SimulationEvent from "@/models/SimulationEvent";
import WorkspaceSession from "@/models/WorkspaceSession";

export async function POST(req: NextRequest) {
  try {
    const { attemptId, events } = await req.json();
    if (!attemptId || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
    }

    await connectWithTimeout(3000);

    // Batch insert events
    await SimulationEvent.insertMany(
      events.map((e: Record<string, unknown>) => ({
        attemptId,
        type: e.type,
        timestamp: new Date(e.timestamp as number),
        stage: e.stage,
        value: e.value,
        payload: e.payload,
        competencySignals: e.competencySignals ?? [],
      }))
    );

    // Update workspace session last activity
    await WorkspaceSession.findOneAndUpdate(
      { attemptId },
      { $set: { lastActivityAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ ok: true, count: events.length });
  } catch (err) {
    console.error("[event POST]", err);
    // Best-effort — don't block the candidate on telemetry failure
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
