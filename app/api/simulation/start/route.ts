import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import { SimulationAttempt } from "@/models/SimulationAttempt";
import { getBrandedSimulationData } from "@/lib/branding";
const simulationData = getBrandedSimulationData();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone } = body;

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and phone are required." },
        { status: 400 }
      );
    }

    let attemptId: string;
    let startedAt: string = new Date().toISOString();
    let reattemptCount = 0;
    let profileId: string | undefined;

    // Select the first 4 sequential missions to preserve narrative context
    const randomizedMissions = ["mission-3", "mission-4", "mission-5", "mission-6"];
    const firstMissionId = randomizedMissions[0];

    if (process.env.MONGO_URI) {
      try {
        await connectWithTimeout(3000);
        
        const { CandidateProfile } = require("@/models/CandidateProfile");

        // Retrieve or create candidate profile
        let profile;
        const existingId = body.candidateId || body.id;
        if (existingId) {
          try {
            profile = await CandidateProfile.findById(existingId);
          } catch (e) {
            console.error("Invalid candidateId format:", e);
          }
        }
        
        if (!profile && body.email) {
          profile = await CandidateProfile.findOne({ email: body.email }).sort({ createdAt: -1 });
        }

        if (!profile) {
          profile = await CandidateProfile.create({
            name: body.name || "Guest",
            email: body.email || "guest@example.com",
            phone: body.phone || body.mobile || "0000000000",
            age: body.age ? Number(body.age) : undefined,
            gender: body.gender,
            degree: body.degree,
            academic_status: body.academic_status || body.year,
            math_background: body.math_background,
            career_interest: body.career_interest,
            skills: body.skills,
            ws_q1: body.ws_q1,
            ws_q2: body.ws_q2,
            ws_q3: body.ws_q3,
            ds_familiarity: body.ds_familiarity ? Number(body.ds_familiarity) : undefined,
            data_comfort: body.data_comfort ? Number(body.data_comfort) : undefined,
            expectations: body.expectations
          });
        } else {
          // If profile exists, make sure to update any final fields passed in
          const updateFields: any = {};
          if (body.name) updateFields.name = body.name;
          if (body.phone || body.mobile) updateFields.phone = body.phone || body.mobile;
          if (body.age) updateFields.age = Number(body.age);
          if (body.gender) updateFields.gender = body.gender;
          if (body.degree) updateFields.degree = body.degree;
          if (body.academic_status || body.year) updateFields.academic_status = body.academic_status || body.year;
          if (body.math_background) updateFields.math_background = body.math_background;
          if (body.career_interest) updateFields.career_interest = body.career_interest;
          if (body.skills) updateFields.skills = body.skills;
          if (body.ws_q1) updateFields.ws_q1 = body.ws_q1;
          if (body.ws_q2) updateFields.ws_q2 = body.ws_q2;
          if (body.ws_q3) updateFields.ws_q3 = body.ws_q3;
          if (body.ds_familiarity) updateFields.ds_familiarity = Number(body.ds_familiarity);
          if (body.data_comfort) updateFields.data_comfort = Number(body.data_comfort);
          if (body.expectations) updateFields.expectations = body.expectations;
          
          await CandidateProfile.findByIdAndUpdate(profile._id, { $set: updateFields });
          console.log(`[Database] Candidate profile UPDATED on simulation start. ID: ${profile._id.toString()}`);
        }

        // Count previous attempts for this candidate (reattemptCount is the number of existing attempts)
        const currentRole = body.role || "data-scientist";
        reattemptCount = await SimulationAttempt.countDocuments({ candidateId: profile._id, role: currentRole });

        // Create the Simulation Attempt linking to the Profile
        const attempt = await SimulationAttempt.create({
          candidateId: profile._id,
          role: currentRole,
          status: "IN_PROGRESS",
          randomizedMissions,
          reattemptCount,
        });

        console.log(`[Database] Simulation Attempt CREATED. ID: ${attempt._id.toString()}, Candidate ID: ${profile._id.toString()}, Reattempts: ${reattemptCount}`);
        attemptId = attempt._id.toString();
        startedAt = attempt.startedAt.toISOString();
        profileId = profile._id.toString();
      } catch (dbErr) {
        console.error("DB error — falling back to in-memory mode:", dbErr);
        attemptId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      }
    } else {
      attemptId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    return NextResponse.json({
      attemptId,
      startedAt,
      firstMissionId,
      randomizedMissions,
      reattemptCount,
      id: profileId,
    });
  } catch (error) {
    console.error("Error starting simulation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
