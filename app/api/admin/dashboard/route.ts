import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import { CandidateProfile } from "@/models/CandidateProfile";
import { SimulationAttempt } from "@/models/SimulationAttempt";
import { SimulationResult } from "@/models/SimulationResult";
import { SimulationResponse } from "@/models/SimulationResponse";

// Disable static rendering for this dynamic API route
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let isDatabaseConnected = false;
  try {
    // Attempt DB connection with timeout
    await connectWithTimeout(3000);
    isDatabaseConnected = true;
  } catch (dbErr) {
    console.error("Dashboard API database connection failed, falling back to mock data:", dbErr);
  }

  try {
    if (isDatabaseConnected) {
      // Auto-complete attempts that have been open for more than 1 hour (3600s)
      try {
        const oneHourAgo = new Date(Date.now() - 3600 * 1000);
        await SimulationAttempt.updateMany(
          {
            status: "IN_PROGRESS",
            startedAt: { $lt: oneHourAgo }
          },
          {
            $set: {
              status: "COMPLETED",
              completedAt: new Date(),
              timeTaken: 3600
            }
          }
        );
      } catch (err) {
        console.error("Failed to auto-complete expired attempts:", err);
      }

      let page = 1;
      let limit = 100;
      try {
        const { searchParams } = new URL(req.url);
        page = parseInt(searchParams.get("page") || "1");
        limit = parseInt(searchParams.get("limit") || "100");
      } catch (e) {}
      
      const skip = (page - 1) * limit;

      // Fetch all candidate profiles (paginated, sorted newest first)
      const profiles = await CandidateProfile.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
      const totalCandidates = await CandidateProfile.countDocuments();
      
      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map((p: any) => p._id);

        // Exclude test attempts from calculations
        const allAttempts = await SimulationAttempt.find({ 
          candidateId: { $in: profileIds },
          isTest: { $ne: true } 
        })
          .sort({ startedAt: -1 })
          .lean();

        const nonTestAttemptIds = allAttempts.map((a: any) => a._id);

        // Scope results and responses queries to the non-test attempts of paginated candidates
        const [allResults, allResponses] = await Promise.all([
          SimulationResult.find({ attemptId: { $in: nonTestAttemptIds } }).lean(),
          SimulationResponse.find({ attemptId: { $in: nonTestAttemptIds } }).sort({ createdAt: 1 }).lean(),
        ]);

        // Index by candidateId (attempts) and attemptId (results, responses)
        const attemptsByCandidate = new Map<string, any[]>();
        allAttempts.forEach((a: any) => {
          const cid = a.candidateId.toString();
          if (!attemptsByCandidate.has(cid)) attemptsByCandidate.set(cid, []);
          attemptsByCandidate.get(cid)!.push(a);
        });

        const resultByAttempt = new Map<string, any>();
        allResults.forEach((r: any) => resultByAttempt.set(r.attemptId.toString(), r));

        const responsesByAttempt = new Map<string, any[]>();
        allResponses.forEach((r: any) => {
          const aid = r.attemptId.toString();
          if (!responsesByAttempt.has(aid)) responsesByAttempt.set(aid, []);
          responsesByAttempt.get(aid)!.push(r);
        });

        const aggregatedCandidates = profiles.map((profile: any) => {
          const cid = (profile._id as any).toString();
          const attempts = attemptsByCandidate.get(cid) || [];

          if (attempts.length === 0) {
            return {
              id: cid,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              age: profile.age,
              gender: profile.gender,
              degree: profile.degree || "Not Specified",
              academicStatus: profile.academic_status || "Not Specified",
              careerInterest: profile.career_interest || "Not Specified",
              skills: profile.skills || [],
              dataComfort: profile.data_comfort || 5,
              dsFamiliarity: profile.ds_familiarity || 5,
              startedAt: null,
              completedAt: null,
              status: "NOT_STARTED" as const,
              role: "data-scientist",
              warningCount: 0,
              warningEvents: [],
              result: null,
              responses: [],
              reattemptCount: 0,
              createdAt: profile.createdAt,
            };
          }

          const latestAttempt = attempts[0];
          const aid = (latestAttempt._id as any).toString();
          const result = resultByAttempt.get(aid) || null;
          const responses = responsesByAttempt.get(aid) || [];

          return {
            id: cid,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            age: profile.age,
            gender: profile.gender,
            degree: profile.degree || "Not Specified",
            academicStatus: profile.academic_status || "Not Specified",
            careerInterest: profile.career_interest || "Not Specified",
            skills: profile.skills || [],
            dataComfort: profile.data_comfort || 5,
            dsFamiliarity: profile.ds_familiarity || 5,
            startedAt: latestAttempt.startedAt,
            completedAt: latestAttempt.completedAt || null,
            timeTaken: (() => {
              const rawTime = latestAttempt.timeTaken || (latestAttempt.completedAt
                ? Math.floor((new Date(latestAttempt.completedAt).getTime() - new Date(latestAttempt.startedAt).getTime()) / 1000)
                : latestAttempt.status === "IN_PROGRESS"
                ? Math.floor((Date.now() - new Date(latestAttempt.startedAt).getTime()) / 1000)
                : null);
              if (rawTime === null || rawTime === undefined) return null;
              return Math.min(rawTime, 3600);
            })(),
            status: latestAttempt.status,
            role: latestAttempt.role || "data-scientist",
            reattemptCount: Math.max(0, attempts.length - 1),
            warningCount: latestAttempt.warningCount || 0,
            warningEvents: latestAttempt.warningEvents || [],
            result: result
              ? {
                  overallScore: result.overallScore,
                  competencyScores: result.competencyScores,
                  readinessLevel: result.readinessLevel,
                  archetype: result.archetype || "Analytical Professional",
                  strengths: result.strengths || [],
                  improvements: result.improvements || [],
                }
              : null,
            responses: responses.map((r: any) => ({
              missionId: r.missionId,
              taskId: r.taskId,
              scoreEarned: r.scoreEarned,
              maxScore: r.maxScore,
              selectedOption: r.selectedOption,
              textValue: r.textValue,
              sliderValue: r.sliderValue,
              competenciesHit: r.competenciesHit || [],
            })),
            createdAt: profile.createdAt,
          };
        });

        if (aggregatedCandidates.length >= 0) {
          return NextResponse.json({
            success: true,
            candidates: aggregatedCandidates,
            total: totalCandidates,
            page,
            limit,
            isMockData: false,
          });
        }
      } else {
        return NextResponse.json({
          success: true,
          candidates: [],
          total: 0,
          page,
          limit,
          isMockData: false,
        });
      }
    }
  } catch (err: any) {
    console.error("Error aggregating dashboard data from database:", err);
  }

  return NextResponse.json({
    success: false,
    candidates: [],
    isMockData: false,
    error: "Database connection failed or query error occurred.",
  });
}

// ── Mock Data Generator ─────────────────────────────────────────────────────
function generateMockCandidates() {
  const names = [
    { name: "Sarah Johnson", email: "sarah.j@edu.university.org" },
    { name: "Michael Chen", email: "mchen99@mit.edu" },
    { name: "Priya Patel", email: "priya.patel@stanford.edu" },
    { name: "David Kim", email: "dkim@berkeley.edu" },
    { name: "Elena Rostova", email: "erostova@oxford.ac.uk" },
    { name: "Alex Mercer", email: "amercer@gatech.edu" },
    { name: "Jordan Vance", email: "jvance@wharton.upenn.edu" },
    { name: "Amina Diop", email: "adiop@columbia.edu" },
    { name: "Li Wei", email: "li.wei@tsinghua.edu.cn" },
    { name: "Chloe Dupont", email: "cdupont@hec.fr" },
    { name: "Marcus Vance", email: "marcus.v@nyu.edu" },
    { name: "Maya Lin", email: "mayalin@utexas.edu" },
    { name: "Devon Lane", email: "devon.lane@uwaterloo.ca" },
    { name: "Siddharth Nair", email: "snair@iitd.ac.in" },
    { name: "Mateo Silva", email: "mateo.silva@usp.br" },
    { name: "Emma Watson", email: "ewatson@brown.edu" },
    { name: "Zarah Khan", email: "zarahk@lse.ac.uk" },
    { name: "Keanu Reeves", email: "keanu.r@utoronto.ca" },
    { name: "Taylor Swift", email: "tswift@nyu.edu" },
    { name: "Dua Lipa", email: "dualipa@cambridge.ac.uk" },
    { name: "Billie Eilish", email: "beilish@usc.edu" },
    { name: "Justin Bieber", email: "jbieber@mcgill.ca" },
    { name: "Robert Downey", email: "rdj@caltech.edu" },
    { name: "Zendaya Coleman", email: "zendaya@oakland.edu" },
    { name: "Tom Holland", email: "tholland@imperial.ac.uk" },
  ];

  const degrees = [
    "B.S. Computer Science",
    "M.S. Data Science",
    "B.A. Business Analytics",
    "Ph.D. Statistics",
    "M.B.A. Business Intelligence",
    "B.S. Economics & Data",
    "M.S. Quantitative Finance",
  ];

  const statusOptions = ["Senior", "Graduate Student", "Alumni", "Junior"];
  
  const careerInterests = [
    "Data Scientist",
    "Machine Learning Engineer",
    "Data Analyst",
    "Quantitative Researcher",
    "Product Analyst",
    "Business Intelligence Engineer",
  ];

  const skillOptions = [
    "Python", "SQL", "Tableau", "Machine Learning", "Statistics", "R",
    "Excel", "Data Visualization", "PowerBI", "Deep Learning", "A/B Testing",
    "Git", "Scikit-Learn", "Pandas", "PyTorch"
  ];

  const archetypes = [
    { name: "Evidence-Driven Analyst", comp: "DataLiteracy" },
    { name: "Strong Investigator", comp: "AnalyticalReasoning" },
    { name: "Business-First Thinker", comp: "BusinessThinking" },
    { name: "Sharp Problem Framer", comp: "ProblemFraming" },
    { name: "Root Cause Detective", comp: "RootCauseAnalysis" },
    { name: "Strategic Prioritizer", comp: "Prioritization" },
    { name: "Data Quality Champion", comp: "DataQualityAwareness" },
    { name: "Emerging Communicator", comp: "Communication" },
  ];

  const mockCandidates = [];

  for (let i = 0; i < names.length; i++) {
    const candidate = names[i];
    const degree = degrees[i % degrees.length];
    const academicStatus = statusOptions[i % statusOptions.length];
    const careerInterest = careerInterests[i % careerInterests.length];
    
    // Choose 3-6 random skills
    const skillsCount = 3 + (i % 4);
    const skills = [...skillOptions]
      .sort(() => 0.5 - Math.random())
      .slice(0, skillsCount);

    const dsFamiliarity = 1 + (i % 9); // 1-10
    const dataComfort = 2 + (i % 8); // 2-10

    // Date over past 30 days
    const startedAtDate = new Date();
    startedAtDate.setDate(startedAtDate.getDate() - (i % 30));
    startedAtDate.setHours(10 + (i % 12), i * 7 % 60, 0, 0);

    // Status: 80% COMPLETED, 12% IN_PROGRESS, 8% TERMINATED
    let status: "COMPLETED" | "IN_PROGRESS" | "TERMINATED" = "COMPLETED";
    if (i % 10 === 8) status = "IN_PROGRESS";
    else if (i % 10 === 9) status = "TERMINATED";

    const completedAtDate = status === "COMPLETED" 
      ? new Date(startedAtDate.getTime() + (12 + (i % 10)) * 60000) // 12-21 minutes later
      : null;

    const timeTakenRaw = completedAtDate 
      ? Math.floor((completedAtDate.getTime() - startedAtDate.getTime()) / 1000)
      : status === "IN_PROGRESS"
      ? Math.floor((Date.now() - startedAtDate.getTime()) / 1000)
      : null;
    const timeTaken = timeTakenRaw !== null ? Math.min(timeTakenRaw, 3600) : null;

    // Warnings
    let warningCount = 0;
    const warningEvents = [];
    if (i % 3 === 0) {
      warningCount = 1;
      warningEvents.push({
        timestamp: new Date(startedAtDate.getTime() + 4 * 60000),
        reason: "Tab switch detected: candidate left simulation window.",
      });
    }
    if (i % 7 === 0) {
      warningCount = 2;
      warningEvents.push({
        timestamp: new Date(startedAtDate.getTime() + 8 * 60000),
        reason: "Window resize detected.",
      });
    }
    if (status === "TERMINATED") {
      warningCount = 3;
      warningEvents.push({
        timestamp: new Date(startedAtDate.getTime() + 10 * 60000),
        reason: "Tab switch detected: limit exceeded. Terminated.",
      });
    }

    // Determine role
    const isSde = i % 4 === 0;
    const role = isSde ? "sde" : "data-scientist";

    // Result & competency scores (completed only)
    let result = null;
    if (status === "COMPLETED" || status === "TERMINATED") {
      const overallScore = 40 + (i * 2.3 % 58) + (status === "TERMINATED" ? -15 : 0);
      const scoreInt = Math.min(100, Math.max(0, Math.round(overallScore)));

      // Generate competency scores centered around overallScore
      const competencyScores: Record<string, number> = {};
      
      if (isSde) {
        const sdeComps = [
          "RequirementUnderstanding", "EngineeringPlanning", "CodebaseNavigation", "InvestigationDebugging",
          "FeatureImplementation", "APIAndDatabaseIntegration", "TestingAndQuality", "EngineeringCommunication",
          "Productivity", "AICollaboration", "EngineeringBehavior", "DeliveryExcellence"
        ];
        sdeComps.forEach((comp, idx) => {
          const offset = -12 + ((i + idx * 5) % 25); // -12 to +12
          competencyScores[comp] = Math.min(100, Math.max(10, Math.round(scoreInt + offset)));
        });
      } else {
        const dsComps = [
          "ProblemFraming", "DataLiteracy", "AnalyticalReasoning", "RootCauseAnalysis",
          "Prioritization", "BusinessThinking", "DataQualityAwareness", "Communication"
        ];
        dsComps.forEach((comp, idx) => {
          const offset = -15 + ((i + idx * 7) % 31); // -15 to +15
          competencyScores[comp] = Math.min(100, Math.max(10, Math.round(scoreInt + offset)));
        });
      }

      // Readiness Level
      let readinessLevel = "Explorer";
      if (scoreInt > 80) readinessLevel = "Industry Ready";
      else if (scoreInt > 60) readinessLevel = "Industry Ready Foundation";
      else if (scoreInt > 40) readinessLevel = "Emerging Professional";

      // Archetype
      let archetype = "Analytical Professional";
      if (isSde) {
        const sdeArchetypes = [
          "Methodical Developer", "Systems Architect", "Pragmatic Engineer",
          "Quality Champion", "Rapid Incident Responder"
        ];
        archetype = sdeArchetypes[i % sdeArchetypes.length];
      } else {
        const archetypeObj = archetypes[i % archetypes.length];
        archetype = archetypeObj.name;
      }

      // Strengths & Improvements
      let strengths: string[] = [];
      let improvements: string[] = [];

      if (isSde) {
        const sdeStrengthsList = [
          "Translating business requirements into clear technical acceptance criteria",
          "Logically planning sprint tasks and placing critical bugs first",
          "Navigating complex directory trees to isolate relevant source code files",
          "Methodically debugging outages by correlating logs with system metrics",
          "Developing correct, standards-aligned timeout and queue configurations",
          "Integrating systems cleanly without introducing resource leaks or deadlocks",
          "Writing and executing comprehensive test suites to validate bug fixes",
          "Documenting code changes thoroughly in structured pull request descriptions",
          "Maintaining a high pace of delivery and minimal idle time during incidents",
          "Collaborating effectively with AI assistants using precise system engineering prompts",
          "Proactively changing approach and refactoring when tests fail",
          "Delivering high-quality sprint reports and clear debrief notes"
        ];

        const sdeImprovementsList = [
          "Practice reading documentation and tracking user flows before beginning implementation",
          "Prioritize P0 customer outages over non-blocking tech debt in sprint planning",
          "Improve speed and familiarity when tracing functions in large codebases",
          "Practice correlating logs and metric timestamps to verify root cause",
          "Study common third-party API timeout and retry window specifications",
          "Study connection pool timeouts and database transaction lock boundaries",
          "Run the full local test suite before submitting pull requests",
          "Ensure PR descriptions always detail verification steps and risk assessment",
          "Avoid task switching and reduce passive idle intervals during active workspace tasks",
          "Leverage AI assistants to speed up boilerplate code generation and edge-case testing",
          "Ensure a systematic approach to code changes rather than ad-hoc trial and error",
          "Structure retro summaries with specific actionable technical improvements"
        ];

        const sdeComps = [
          "RequirementUnderstanding", "EngineeringPlanning", "CodebaseNavigation", "InvestigationDebugging",
          "FeatureImplementation", "APIAndDatabaseIntegration", "TestingAndQuality", "EngineeringCommunication",
          "Productivity", "AICollaboration", "EngineeringBehavior", "DeliveryExcellence"
        ];

        const sortedSdeComps = Object.entries(competencyScores).sort((a, b) => b[1] - a[1]);
        strengths = [
          sdeStrengthsList[sdeComps.indexOf(sortedSdeComps[0][0])],
          sdeStrengthsList[sdeComps.indexOf(sortedSdeComps[1][0])],
        ];
        improvements = [
          sdeImprovementsList[sdeComps.indexOf(sortedSdeComps[sortedSdeComps.length - 1][0])],
          sdeImprovementsList[sdeComps.indexOf(sortedSdeComps[sortedSdeComps.length - 2][0])],
        ];
      } else {
        const dsStrengthsList = [
          "Structuring ambiguous problems systematically",
          "Reading and interpreting data dashboards",
          "Forming and validating hypotheses from data",
          "Identifying root causes from evidence",
          "Prioritizing high-impact investigations",
          "Connecting data insights to business outcomes",
          "Recognizing data quality risks",
          "Communicating findings clearly to stakeholders"
        ];

        const dsImprovementsList = [
          "Work on breaking down vague problems into measurable questions",
          "Practice reading and interpreting multi-metric dashboards",
          "Work on structuring hypotheses before jumping to conclusions",
          "Practice the 5-Why framework for investigating issues",
          "Build intuition for weighing urgency vs. impact",
          "Focus on connecting data findings to revenue and cost impact",
          "Study common data quality issues and their downstream effects",
          "Practice summarizing insights in executive-friendly language"
        ];

        const dsComps = [
          "ProblemFraming", "DataLiteracy", "AnalyticalReasoning", "RootCauseAnalysis",
          "Prioritization", "BusinessThinking", "DataQualityAwareness", "Communication"
        ];

        const sortedDsComps = Object.entries(competencyScores).sort((a, b) => b[1] - a[1]);
        strengths = [
          dsStrengthsList[dsComps.indexOf(sortedDsComps[0][0])],
          dsStrengthsList[dsComps.indexOf(sortedDsComps[1][0])],
        ];
        improvements = [
          dsImprovementsList[dsComps.indexOf(sortedDsComps[sortedDsComps.length - 1][0])],
          dsImprovementsList[dsComps.indexOf(sortedDsComps[sortedDsComps.length - 2][0])],
        ];
      }

      result = {
        overallScore: scoreInt,
        competencyScores,
        readinessLevel,
        archetype,
        strengths,
        improvements,
      };
    }

    // Generate detailed responses (completed has max, terminated has fewer, in_progress has 1 or 2)
    const responses = [];
    
    if (isSde) {
      const responseCount = status === "COMPLETED" ? 6 : (status === "TERMINATED" ? 3 : 1);
      
      const sdeTasks = [
        {
          taskId: "sprint-planning",
          missionId: "sprint-planning",
          interactionType: "Ranking",
          title: "Sprint Planning",
          description: "Prioritized the sprint backlog for Sprint 22. Placed critical bug fix (FIN-2847) first.",
          isCorrect: true,
          textValue: undefined,
          competenciesHit: ["EngineeringPlanning"]
        },
        {
          taskId: "webhook-fix",
          missionId: "implementation",
          interactionType: "SingleSelect",
          title: "Stripe Webhook Timeout Fix",
          description: "Applied the optimal timeout fix configuration: fix-a (5000ms delay timeout).",
          isCorrect: true,
          textValue: undefined,
          competenciesHit: ["FeatureImplementation"]
        },
        {
          taskId: "root-cause",
          missionId: "incident",
          interactionType: "SingleSelect",
          title: "Outage Root Cause Analysis",
          description: "Identified the root cause: rc-a (Stripe webhook signature verify fails due to payload mismatch).",
          isCorrect: true,
          textValue: undefined,
          competenciesHit: ["InvestigationDebugging"]
        },
        {
          taskId: "pr-submission",
          missionId: "pr-review",
          interactionType: "ShortText",
          title: "PR Submission: fix webhook timeout for Stripe events",
          description: "Created a pull request for the webhook delay fix.",
          isCorrect: true,
          textValue: "fix: increase webhook queue timeout for Stripe events (FIN-2847)\n\nWhat changed: Increased queue retry delays.\nVerification: Verified Stripe max response window is 5000ms.",
          competenciesHit: ["EngineeringCommunication", "DeliveryExcellence"]
        },
        {
          taskId: "slack-update",
          missionId: "communication",
          interactionType: "ShortText",
          title: "Platform Alert Update (#platform-alerts)",
          description: "Sent an incident update slack notification to stakeholders.",
          isCorrect: true,
          textValue: "[Resolved] Checkout outage root caused and fix merged. Webhook verifies successfully now. Services operating at 100% capacity.",
          competenciesHit: ["EngineeringCommunication"]
        },
        {
          taskId: "sprint-retro",
          missionId: "sprint-review",
          interactionType: "ShortText",
          title: "Sprint 22 Retrospective Notes",
          description: "Wrote retrospective notes covering sprint delivery and improvements.",
          isCorrect: true,
          textValue: "Sprint retrospect note: We successfully resolved the payment gateway P1 outage. Moving forward, we should set up automated regression tests for Stripe webhook integrations and ensure proper documentation is in place for fallback environments.",
          competenciesHit: ["DeliveryExcellence"]
        }
      ];

      for (let r = 0; r < responseCount; r++) {
        const t = sdeTasks[r];
        const isCorrect = (i + r) % 5 !== 0; // mostly correct
        const scoreEarned = isCorrect ? 100 : 50;

        responses.push({
          missionId: t.missionId,
          taskId: t.taskId,
          scoreEarned,
          maxScore: 100,
          selectedOption: {
            title: t.title,
            description: t.description,
            isCorrect,
          },
          textValue: t.textValue,
          sliderValue: undefined,
          competenciesHit: t.competenciesHit,
        });
      }
    } else {
      const responseCount = status === "COMPLETED" ? 8 : (status === "TERMINATED" ? 4 : 2);
      
      const missionNames = [
        "M1: Onboarding & Data Load Check",
        "M2: SQL Pipeline Investigation",
        "M3: Dashboard Anomaly Discovery",
        "M4: Root Cause Deep-Dive",
        "M5: Business Impact Valuation",
        "M6: A/B Test Hypotheses",
        "M7: Presentation Preparation",
        "M8: Stakeholder Briefing"
      ];

      const promptDetails = [
        "Identify the incorrect join type causing missing user transactions.",
        "Diagnose slow query performance in the customer dashboard database.",
        "Isolate a drop in core conversions for iOS v15 users.",
        "Investigate third-party payment gateway latency spike.",
        "Calculate financial loss due to checkout downtime in Q2.",
        "Formulate statistical null and alternative hypotheses for button test.",
        "Filter out anomalous bot transactions from core metrics.",
        "Explain the trade-offs of the chosen solution to the Chief Product Officer."
      ];

      const compMapping = [
        ["ProblemFraming", "DataLiteracy"],
        ["AnalyticalReasoning", "DataQualityAwareness"],
        ["DataLiteracy", "AnalyticalReasoning"],
        ["RootCauseAnalysis", "Prioritization"],
        ["BusinessThinking", "Prioritization"],
        ["AnalyticalReasoning", "ProblemFraming"],
        ["DataQualityAwareness", "AnalyticalReasoning"],
        ["Communication", "BusinessThinking"]
      ];

      for (let r = 0; r < responseCount; r++) {
        const isCorrect = (i + r) % 3 !== 0; // 66% correct rate
        const maxScore = 10;
        const scoreEarned = isCorrect ? 10 : (3 + ((i + r) % 5)); // 3-7 score

        responses.push({
          missionId: `mission_${r + 1}`,
          taskId: `task_${r + 1}`,
          scoreEarned,
          maxScore,
          selectedOption: {
            title: missionNames[r],
            description: promptDetails[r],
            isCorrect,
          },
          textValue: isCorrect 
            ? "I isolated the issue by matching the timestamps across logs."
            : "I think the query might be missing index variables.",
          sliderValue: scoreEarned * 10,
          competenciesHit: compMapping[r],
        });
      }
    }

    mockCandidates.push({
      id: `mock_${i + 1}`,
      name: candidate.name,
      email: candidate.email,
      phone: "+1 (555) 019-" + (1000 + i).toString().substring(1),
      age: 20 + (i % 8),
      gender: i % 3 === 0 ? "Male" : i % 3 === 1 ? "Female" : "Non-binary",
      degree,
      academicStatus,
      careerInterest,
      skills,
      dataComfort,
      dsFamiliarity,
      startedAt: startedAtDate.toISOString(),
      completedAt: completedAtDate ? completedAtDate.toISOString() : null,
      timeTaken,
      status,
      role,
      warningCount,
      warningEvents,
      result,
      responses,
      createdAt: startedAtDate.toISOString(),
    });
  }

  // Sort candidates by creation date descending
  return mockCandidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
