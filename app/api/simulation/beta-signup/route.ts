import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { SimulationAttempt } from "@/models/SimulationAttempt";
import { CandidateProfile } from "@/models/CandidateProfile";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { attemptId } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });
    }

    const attempt = await SimulationAttempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const candidate = await CandidateProfile.findById(attempt.candidateId);
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    candidate.beta_signup = true;
    await candidate.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Beta signup error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
