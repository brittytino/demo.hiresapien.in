import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, phone } = body;

    await connectWithTimeout(3000);
    const { CandidateProfile } = require("@/models/CandidateProfile");

    let profile;
    const lookupId = id || body.candidateId;

    if (lookupId) {
      try {
        profile = await CandidateProfile.findById(lookupId);
      } catch (e) {
        console.error("Invalid id format:", e);
      }
    }

    if (!profile && email) {
      profile = await CandidateProfile.findOne({ email }).sort({ createdAt: -1 });
    }

    if (profile) {
      // Update existing profile
      const updateData: any = {};
      const allowedFields = [
        "name",
        "email",
        "phone",
        "age",
        "gender",
        "degree",
        "academic_status",
        "math_background",
        "career_interest",
        "skills",
        "ws_q1",
        "ws_q2",
        "ws_q3",
        "ds_familiarity",
        "data_comfort",
        "expectations",
        "beta_signup"
      ];

      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          if (field === "age" || field === "ds_familiarity" || field === "data_comfort") {
            updateData[field] = Number(body[field]);
          } else {
            updateData[field] = body[field];
          }
        }
      }

      profile = await CandidateProfile.findByIdAndUpdate(
        profile._id,
        { $set: updateData },
        { returnDocument: 'after' }
      );

      console.log(`[Database] Candidate profile UPDATED. ID: ${profile._id.toString()}, Updated Fields: ${Object.keys(updateData).join(", ")}`);
    } else {
      // Create new profile
      if (!name || !email || !phone) {
        return NextResponse.json(
          { error: "Missing required fields: name, email, and phone are required." },
          { status: 400 }
        );
      }

      profile = await CandidateProfile.create({
        name,
        email,
        phone,
        age: body.age ? Number(body.age) : undefined,
        gender: body.gender,
        degree: body.degree,
        academic_status: body.academic_status,
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

      console.log(`[Database] Candidate profile CREATED. ID: ${profile._id.toString()}, Email: ${email}`);
    }

    return NextResponse.json({ success: true, id: profile._id.toString() });
  } catch (error: any) {
    console.error("Error in /api/candidate/save:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
