"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  Users,
  Target,
  Activity,
  FileCheck,
  TrendingUp,
  Award,
  Search,
  Filter,
  Shield,
  Sliders,
  ChevronRight,
  Download,
  Calendar,
  X,
  Clock,
  Sparkles,
  BrainCircuit,
  Eye,
  AlertTriangle,
  Save,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  RotateCw,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Info,
  LogOut
} from "lucide-react";
import { BsCheckCircleFill, BsXCircleFill, BsDashCircleFill, BsListCheck, BsTextParagraph, BsSliders2, BsSortDown, BsToggle2On, BsBarChartFill } from "react-icons/bs";
import { HiOutlineLightBulb, HiOutlineSparkles } from "react-icons/hi2";
import { MdOutlineScoreboard } from "react-icons/md";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InstitutionalDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isMockData, setIsMockData] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "candidates" | "competencies">("overview");

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReadiness, setFilterReadiness] = useState("All");
  const [filterDegree, setFilterDegree] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterArchetype, setFilterArchetype] = useState("All");
  const [filterRole, setFilterRole] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date" | "warnings">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection & Details Drawer State
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [noteText, setNoteText] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);



  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Set mounted and check auth status
  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth-check");
        if (res.status === 401) {
          window.location.href = "/admin/login";
        } else {
          const data = await res.json();
          if (data.authenticated) {
            setAdminUser(data.user);
            setCheckingAuth(false);
          } else {
            window.location.href = "/admin/login";
          }
        }
      } catch (err) {
        window.location.href = "/admin/login";
      }
    };
    checkAuth();
  }, []);

  // Fetch Dashboard & Configuration Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const dbResponse = await fetch("/api/admin/dashboard");
      const dbData = await dbResponse.json();
      if (dbData.success) {
        setCandidates(dbData.candidates || []);
        setIsMockData(dbData.isMockData || false);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Load notes when a candidate is selected
  useEffect(() => {
    if (selectedCandidate) {
      const storedNote = localStorage.getItem(`sona_notes_${selectedCandidate.id}`);
      setNoteText(storedNote || "");
      setNoteSaved(false);
    }
  }, [selectedCandidate]);

  const saveCandidateNotes = () => {
    if (selectedCandidate) {
      localStorage.setItem(`sona_notes_${selectedCandidate.id}`, noteText);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    }
  };
  // Competency Labels helper
  const competencyLabels: Record<string, string> = {
    AnalyticalReasoning: "Investigation",
    DataLiteracy: "Interpretation",
    Prioritization: "Decision Quality",
    BusinessThinking: "Business Awareness",
    Communication: "Communication",
    // 12-competency framework extensions
    RequirementUnderstanding: "Requirement Understanding",
    EngineeringPlanning: "Engineering Planning",
    CodebaseNavigation: "Codebase Navigation",
    InvestigationDebugging: "Investigation & Debugging",
    FeatureImplementation: "Feature Implementation",
    APIAndDatabaseIntegration: "API & DB Integration",
    TestingAndQuality: "Testing & Quality",
    EngineeringCommunication: "Engineering Communication",
    Productivity: "Productivity",
    AICollaboration: "AI Collaboration",
    EngineeringBehavior: "Engineering Behavior",
    DeliveryExcellence: "Delivery Excellence",
  };

  const formatTimeTaken = (seconds: number | null | undefined, status?: string) => {
    if (seconds === null || seconds === undefined) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const timeStr = `${m}m ${s}s`;
    if (status === "IN_PROGRESS") {
      return `${timeStr} (In Progress)`;
    }
    return timeStr;
  };

  // ── DATA COMPUTATIONS & METRICS ──────────────────────────────────────────
  // Cohort candidates filtered by active selectors (excluding search query to keep cohort stats stable)
  const cohortCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchesReadiness =
        filterReadiness === "All" ||
        c.result?.readinessLevel === filterReadiness;

      const matchesDegree =
        filterDegree === "All" || c.degree === filterDegree;

      const matchesStatus =
        filterStatus === "All" || c.status === filterStatus;

      const matchesArchetype =
        filterArchetype === "All" ||
        c.result?.archetype === filterArchetype;

      const matchesRole =
        filterRole === "All" || c.role === filterRole;

      return (
        matchesReadiness &&
        matchesDegree &&
        matchesStatus &&
        matchesArchetype &&
        matchesRole
      );
    });
  }, [candidates, filterReadiness, filterDegree, filterStatus, filterArchetype, filterRole]);

  // ── DATA COMPUTATIONS & METRICS ──────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = cohortCandidates.length;
    const completedAttempts = cohortCandidates.filter(c => c.status === "COMPLETED");
    const completedCount = completedAttempts.length;
    const inProgressCount = cohortCandidates.filter(c => c.status === "IN_PROGRESS").length;
    const terminatedCount = cohortCandidates.filter(c => c.status === "TERMINATED").length;

    const completionRate = total > 0 ? Math.round((completedCount / (total - inProgressCount)) * 100) : 0;
    
    // Average overall score of completed candidates
    const avgScore = completedCount > 0
      ? Math.round(completedAttempts.reduce((acc, curr) => acc + (curr.result?.overallScore || 0), 0) / completedCount)
      : 0;

    // Total violations
    const totalWarnings = cohortCandidates.reduce((acc, curr) => acc + (curr.warningCount || 0), 0);
    
    // Integrity rate (percent of candidates with 0 warnings)
    const compliantCount = cohortCandidates.filter(c => (c.warningCount || 0) === 0).length;
    const integrityRate = total > 0 ? Math.round((compliantCount / total) * 1000) / 10 : 100;

    // Average duration (mock simulation is 12-21 mins, real ones can vary)
    let avgDurationMin = 15;
    const completedWithDuration = completedAttempts.filter(c => c.startedAt && c.completedAt);
    if (completedWithDuration.length > 0) {
      const sumDur = completedWithDuration.reduce((acc, curr) => {
        const start = new Date(curr.startedAt).getTime();
        const end = new Date(curr.completedAt).getTime();
        return acc + (end - start);
      }, 0);
      avgDurationMin = Math.round(sumDur / completedWithDuration.length / 60000);
    }

    // Cohort Degrees unique list
    const allDegrees = Array.from(new Set(candidates.map(c => c.degree || "Not Specified")));
    // Archetypes unique list
    const allArchetypes = Array.from(new Set(candidates.filter(c => c.result?.archetype).map(c => c.result.archetype)));

    return {
      total,
      completedCount,
      inProgressCount,
      terminatedCount,
      completionRate,
      avgScore,
      totalWarnings,
      integrityRate,
      avgDurationMin,
      allDegrees,
      allArchetypes,
    };
  }, [cohortCandidates, candidates]);

  // Filters candidates based on search query, tags, and sidebar configurations
  const filteredCandidates = useMemo(() => {
    return cohortCandidates
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;

        if (sortBy === "score") {
          valA = a.result?.overallScore ?? -1;
          valB = b.result?.overallScore ?? -1;
        } else if (sortBy === "date") {
          valA = new Date(a.createdAt || a.startedAt || 0).getTime();
          valB = new Date(b.createdAt || b.startedAt || 0).getTime();
        } else if (sortBy === "warnings") {
          valA = a.warningCount || 0;
          valB = b.warningCount || 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [cohortCandidates, searchQuery, sortBy, sortOrder]);

  // ── CHART DATA GENERATORS ────────────────────────────────────────────────
  const chartsData = useMemo(() => {
    // 1. Readiness Levels Distribution Chart
    const readinessMap: Record<string, number> = {
      "Industry Ready": 0,
      "Industry Ready Foundation": 0,
      "Emerging Professional": 0,
      "Explorer": 0,
    };
    
    cohortCandidates.forEach(c => {
      if (c.result?.readinessLevel && readinessMap[c.result.readinessLevel] !== undefined) {
        readinessMap[c.result.readinessLevel]++;
      }
    });

    const readinessColors: Record<string, string> = {
      "Industry Ready": "#10B981",          // Emerald
      "Industry Ready Foundation": "#2563FF", // Sona Blue
      "Emerging Professional": "#F59E0B",    // Amber
      "Explorer": "#EF4444",                 // Rose
    };

    const readinessChartData = Object.entries(readinessMap)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: readinessColors[name] || "#6C3DFF",
      }));

    // 2. Score Trends Over Time Chart (Grouping by date)
    const datesMap: Record<string, { count: number; totalScore: number }> = {};
    cohortCandidates.forEach((c) => {
      const dateStr = new Date(c.createdAt || c.startedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      if (!datesMap[dateStr]) {
        datesMap[dateStr] = { count: 0, totalScore: 0 };
      }
      if (c.status === "COMPLETED" && c.result?.overallScore) {
        datesMap[dateStr].count++;
        datesMap[dateStr].totalScore += c.result.overallScore;
      }
    });

    // Convert to sorted list (chronological order)
    const scoreTrendData = Object.entries(datesMap)
      .map(([date, stats]) => ({
        date,
        attempts: stats.count,
        avgScore: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
      }))
      // Simple reverse check to keep historical order since original candidates was sorted desc
      .reverse();

    // 3. Competency Cohort Averages Chart
    const completedAttempts = cohortCandidates.filter(c => c.status === "COMPLETED");
    const competencyAverages: Record<string, number> = {};
    const competencyCounts: Record<string, number> = {};

    if (completedAttempts.length > 0) {
      completedAttempts.forEach((c) => {
        if (c.result?.competencyScores) {
          Object.entries(c.result.competencyScores).forEach(([comp, score]) => {
            if (typeof score === "number") {
              competencyAverages[comp] = (competencyAverages[comp] || 0) + score;
              competencyCounts[comp] = (competencyCounts[comp] || 0) + 1;
            }
          });
        }
      });

      Object.keys(competencyAverages).forEach((comp) => {
        competencyAverages[comp] = Math.round(competencyAverages[comp] / competencyCounts[comp]);
      });
    } else {
      // Fallback defaults based on role selection
      const defaults = filterRole === "sde"
        ? ["RequirementUnderstanding", "EngineeringPlanning", "CodebaseNavigation", "InvestigationDebugging", "FeatureImplementation", "TestingAndQuality", "EngineeringCommunication", "DeliveryExcellence"]
        : ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"];
      defaults.forEach((comp) => {
        competencyAverages[comp] = 70;
      });
    }

    const competencyRadarData = Object.entries(competencyAverages).map(([key, value]) => ({
      subject: competencyLabels[key] || key,
      average: value,
      fullMark: 100,
    }));

    // Competency GAP rankings (ordered highest to lowest)
    const competencyGapData = Object.entries(competencyAverages)
      .map(([key, value]) => ({
        key,
        competency: competencyLabels[key] || key,
        score: value,
        gap: 100 - value,
      }))
      .sort((a, b) => b.score - a.score);

    // 4. Violation Warnings Reason Chart
    const warningsMap: Record<string, number> = {
      "Tab switch detected": 0,
      "Window resize detected": 0,
      "Exit full screen warning": 0,
      "Other": 0,
    };

    cohortCandidates.forEach((c) => {
      if (c.warningEvents) {
        c.warningEvents.forEach((ev: any) => {
          const reason = ev.reason.toLowerCase();
          if (reason.includes("tab switch") || reason.includes("left simulation")) {
            warningsMap["Tab switch detected"]++;
          } else if (reason.includes("resize")) {
            warningsMap["Window resize detected"]++;
          } else if (reason.includes("fullscreen") || reason.includes("exit full")) {
            warningsMap["Exit full screen warning"]++;
          } else {
            warningsMap["Other"]++;
          }
        });
      }
    });

    const warningsChartData = Object.entries(warningsMap).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      readinessChartData,
      scoreTrendData,
      competencyRadarData,
      competencyGapData,
      warningsChartData,
    };
  }, [cohortCandidates, filterRole]);

  // ── DETAILED EXPORT GENERATORS ───────────────────────────────────────────
  const exportAllCandidatesToExcel = () => {
    const dataToExport = filteredCandidates.map((c) => ({
      "Candidate Name": c.name,
      "Email Address": c.email,
      "Phone Number": c.phone,
      "Age": c.age ?? "N/A",
      "Gender": c.gender ?? "N/A",
      "Assessment Role": c.role === "sde" ? "Software Engineer (SDE)" : "Data Scientist",
      "Degree/Cohort": c.degree,
      "Academic Status": c.academicStatus,
      "Date Taken": c.completedAt ? new Date(c.completedAt).toLocaleDateString() : "N/A",
      "Time Taken": c.timeTaken ? `${Math.floor(c.timeTaken / 60)}m ${c.timeTaken % 60}s` : "N/A",
      "Reattempts": c.reattemptCount || 0,
      "Simulation Status": c.status,
      "Overall Score": c.result?.overallScore ?? "N/A",
      "Readiness Level": c.result?.readinessLevel ?? "N/A",
      "Archetype": c.result?.archetype ?? "N/A",
      "Warnings Logged": c.warningCount,
      "Familiarity with DS": c.dsFamiliarity,
      "Comfort with Data": c.dataComfort,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sona Candidates");
    XLSX.writeFile(wb, `Sona_Institutional_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const exportSingleCandidateToExcel = (c: any) => {
    if (!c) return;

    // Sheet 1: Profile & Scoring Summary
    const profileSummary = [
      { Field: "Candidate Name", Value: c.name },
      { Field: "Email Address", Value: c.email },
      { Field: "Phone Number", Value: c.phone },
      { Field: "Age", Value: c.age ?? "N/A" },
      { Field: "Gender", Value: c.gender ?? "N/A" },
      { Field: "Assessment Role", Value: c.role === "sde" ? "Software Engineer (SDE)" : "Data Scientist" },
      { Field: "Degree/Department", Value: c.degree },
      { Field: "Academic Status", Value: c.academicStatus },
      { Field: "Simulation Status", Value: c.status },
      { Field: "Date Attempted", Value: new Date(c.createdAt || c.startedAt).toLocaleString() },
      { Field: "Date Completed", Value: c.completedAt ? new Date(c.completedAt).toLocaleString() : "N/A" },
      { Field: "Time Taken", Value: c.timeTaken ? `${Math.floor(c.timeTaken / 60)}m ${c.timeTaken % 60}s` : "N/A" },
      { Field: "Reattempts", Value: c.reattemptCount || 0 },
      { Field: "Warning Count", Value: c.warningCount },
      { Field: "DS Familiarity Score", Value: c.dsFamiliarity },
      { Field: "Data Comfort Score", Value: c.dataComfort },
      { Field: "", Value: "" },
      { Field: "SIMULATION SCORES", Value: "" },
      { Field: "Overall Score", Value: c.result?.overallScore ? `${c.result.overallScore}/100` : "N/A" },
      { Field: "Readiness Level", Value: c.result?.readinessLevel ?? "N/A" },
      { Field: "Archetype Profile", Value: c.result?.archetype ?? "N/A" },
    ];

    const compScores = c.result?.competencyScores 
      ? Object.entries(c.result.competencyScores).map(([k, v]) => ({
          Competency: competencyLabels[k] || k,
          Score: `${v}/100`,
        }))
      : [];

    const wsProfile = XLSX.utils.json_to_sheet(profileSummary);
    const wsComps = XLSX.utils.json_to_sheet(compScores);

    // Sheet 2: Responses logs
    const responsesSummary = c.responses.map((r: any, idx: number) => ({
      "Mission Index": idx + 1,
      "Mission ID": r.missionId,
      "Task ID": r.taskId,
      "Mission Name": r.selectedOption?.title || "N/A",
      "Prompt Question": r.selectedOption?.description || "N/A",
      "Candidate Free-text Response": r.textValue || "N/A",
      "Interactive Score (Slider/Metric)": r.sliderValue ?? "N/A",
      "Earned Score": r.scoreEarned,
      "Max Score": r.maxScore,
      "Percentage": `${Math.round((r.scoreEarned / r.maxScore) * 100)}%`,
      "Competencies Targets": r.competenciesHit.join(", "),
    }));
    const wsResponses = XLSX.utils.json_to_sheet(responsesSummary);

    // Sheet 3: Proctoring Alerts
    const proctoringAlerts = c.warningEvents.map((ev: any) => ({
      Timestamp: new Date(ev.timestamp).toLocaleTimeString(),
      Reason: ev.reason,
    }));
    const wsProctoring = XLSX.utils.json_to_sheet(proctoringAlerts);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsProfile, "Summary Profile");
    if (compScores.length > 0) XLSX.utils.book_append_sheet(wb, wsComps, "Competencies Breakdown");
    XLSX.utils.book_append_sheet(wb, wsResponses, "Sim Response Log");
    XLSX.utils.book_append_sheet(wb, wsProctoring, "Proctoring Security Audit");

    XLSX.writeFile(wb, `Sona_Report_${c.name.replace(/\s+/g, "_")}.xlsx`);
  };

  const exportSingleCandidateToPDF = (c: any) => {
    if (!c) return;
    
    // Using window print with specific styling or jsPDF for structured file output
    const reportElement = document.getElementById("pdf-report-canvas");
    if (!reportElement) return;

    // Show report canvas temporarily for pdf capture
    reportElement.style.display = "block";

    html2canvas(reportElement, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 295; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Sona_Analytical_Profile_${c.name.replace(/\s+/g, "_")}.pdf`);
      reportElement.style.display = "none";
    });
  };

  // Chronological proctoring stream computed
  const proctoringStream = useMemo(() => {
    const stream: any[] = [];
    candidates.forEach((c) => {
      if (c.warningEvents) {
        c.warningEvents.forEach((ev: any) => {
          stream.push({
            candidateId: c.id,
            name: c.name,
            email: c.email,
            timestamp: new Date(ev.timestamp),
            reason: ev.reason,
            totalWarningsSoFar: c.warningCount,
          });
        });
      }
    });
    // Sort chronological descending (recent first)
    return stream.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [candidates]);

  // High risk list (warning count >= 3 or status terminated)
  const highRiskCandidates = useMemo(() => {
    return candidates.filter(c => c.warningCount >= 2 || c.status === "TERMINATED");
  }, [candidates]);

  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 font-sans text-slate-800">
        <RotateCw className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Verifying session credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between p-6 shrink-0 relative z-30">
        <div className="flex flex-col gap-8">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 py-2 border-b border-slate-200">
            <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Award className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900 leading-none">SONA</span>
                <span className="text-[9px] font-black uppercase bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded tracking-widest leading-none">Scale</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Institution Portal</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${
                activeTab === "overview"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Activity className="w-5.5 h-5.5" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("candidates")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${
                activeTab === "candidates"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Users className="w-5.5 h-5.5" />
              <span>Candidates Directory</span>
              {filteredCandidates.length !== candidates.length && (
                <span className="ml-auto text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-full">
                  {filteredCandidates.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("competencies")}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm tracking-wide transition-all border ${
                activeTab === "competencies"
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Target className="w-5.5 h-5.5" />
              <span>Competency Matrix</span>
            </button>

          </nav>
        </div>

        {/* Database Sync Status Indicators (at bottom) */}
        <div className="flex flex-col gap-3.5 pt-4 border-t border-slate-200/80">
          
          {/* Admin User Info Card */}
          {adminUser && (
            <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{adminUser.fullName}</p>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5 truncate">{adminUser.role.replace("_", " ")}</p>
              </div>
              
              <button
                onClick={async () => {
                  await fetch("/api/admin/logout", { method: "POST" });
                  window.location.href = "/admin/login";
                }}
                className="p-1.5 bg-slate-100/60 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 rounded-lg transition-colors cursor-pointer select-none"
                title="Logout of admin session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isMockData ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-[11px] font-bold text-slate-500">
              {isMockData ? "Mock Synthetic Server Mode" : "MongoDB Production Connect"}
            </span>
          </div>
          
          <button 
            onClick={() => fetchData()}
            className="flex items-center gap-2 text-slate-450 hover:text-slate-650 transition-colors text-xs font-bold w-full select-none cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Sync Live Records</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        
        {/* Dynamic Top Header Bar */}
        <header className="h-20 bg-white/80 backdrop-blur border-b border-slate-200/60 px-8 flex items-center justify-between shrink-0 z-20">
          <div>
            <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight flex items-center gap-2.5">
              <span>{`${activeTab} Analyzer`}</span>
              {isMockData && activeTab === "overview" && (
                <span className="text-[9px] bg-amber-50/15 border border-amber-500/20 text-amber-600 font-bold uppercase py-0.5 px-2 rounded-full tracking-wider">
                  Demo Workspace
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium">Sona Scale Interactive Analytics Engine</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-700 font-bold">{adminUser?.fullName || "University Admin"}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {adminUser?.role ? adminUser.role.replace("_", " ") : "Faculty Role"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-black text-sm text-blue-600">
              {adminUser?.fullName ? adminUser.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() : "UA"}
            </div>
          </div>
        </header>

        {/* Content Box (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <RotateCw className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm font-semibold text-slate-400">Aggregating simulation databases...</p>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-8"
            >
              
              {/* ─────────────────────────────────────────────────────────────
                  1. OVERVIEW TAB
              ───────────────────────────────────────────────────────────── */}
              {activeTab === "overview" && (
                <>
                  {/* High Level Key Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Card 1: Total Candidates */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-200/40">
                          <TrendingUp className="w-3 h-3" />
                          <span>+12%</span>
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Total Candidates</p>
                      <h3 className="text-3xl font-black text-slate-900">{metrics.total}</h3>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span>{metrics.inProgressCount} active simulators right now</span>
                      </div>
                    </div>

                    {/* Card 2: Average Readiness Score */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Target className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-200/40">
                          Goal 70%
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Avg Overall Score</p>
                      <h3 className="text-3xl font-black text-slate-900">{metrics.avgScore}<span className="text-slate-400 text-lg font-bold">/100</span></h3>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${metrics.avgScore}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Completion Rate */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200/40">
                          {metrics.completedCount} / {metrics.total - metrics.inProgressCount}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Completion Rate</p>
                      <h3 className="text-3xl font-black text-slate-900">{metrics.completionRate}%</h3>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span>Excluding in-progress attempts</span>
                      </div>
                    </div>

                    {/* Card 4: Integrity/Proctor Compliance */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full group-hover:bg-amber-500/10 transition-colors" />
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                          <Shield className="w-6 h-6" />
                        </div>
                        {metrics.totalWarnings > 0 && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200/40">
                            {metrics.totalWarnings} Alerts
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Session Integrity</p>
                      <h3 className="text-3xl font-black text-slate-900">{metrics.integrityRate}%</h3>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <span>Compliant, zero-alert sessions</span>
                      </div>
                    </div>

                  </div>

                  {/* Primary Visualizations Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Area Chart: Score and Attempt trends */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="text-base font-black text-slate-900 tracking-tight">Timeline Performance Analytics</h4>
                          <p className="text-xs text-slate-500 font-medium">Tracking completion volumes and daily score trends</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                            <span>Average Score</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600/35 border border-indigo-400" />
                            <span>Attempt Volume</span>
                          </div>
                        </div>
                      </div>

                      <div className="h-80 w-full">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartsData.scoreTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorAvgScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563FF" stopOpacity={0.25} />
                                  <stop offset="95%" stopColor="#2563FF" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6C3DFF" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#6C3DFF" stopOpacity={0.0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                              <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontWeight="bold" />
                              <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" domain={[0, 100]} />
                              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                              <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="#2563FF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAvgScore)" />
                              <Area type="monotone" dataKey="attempts" name="Completed Attempts" stroke="#6C3DFF" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAttempts)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Pie Chart: Readiness Levels */}
                    <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight">Readiness Distribution</h4>
                        <p className="text-xs text-slate-500 font-medium">Current competency distribution of cohort</p>
                      </div>

                      <div className="h-52 w-full my-4 flex items-center justify-center relative">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartsData.readinessChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={58}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {chartsData.readinessChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-3xl font-black text-slate-900 leading-none">
                            {metrics.completedCount}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Evaluated</span>
                        </div>
                      </div>

                      {/* Pie chart legends */}
                      <div className="flex flex-col gap-2">
                        {chartsData.readinessChartData.map((r, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                              <span className="text-slate-600">{r.name}</span>
                            </div>
                            <span className="text-slate-800 font-bold">{r.value} candidates</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Secondary analytics: Cohort metrics tables */}
                  <div className="grid grid-cols-1 gap-8">
                    
                    {/* Average score by Academic Degree */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-base font-black text-slate-900 tracking-tight mb-4">Cohort Performance by Degree Stream</h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                              <th className="pb-3">Degree Specialization</th>
                              <th className="pb-3 text-center">Completes</th>
                              <th className="pb-3 text-right">Avg Score</th>
                              <th className="pb-3 text-right">Compliance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                            {metrics.allDegrees.slice(0, 5).map((deg, idx) => {
                              const degreeCandidates = candidates.filter(c => c.degree === deg);
                              const completed = degreeCandidates.filter(c => c.status === "COMPLETED");
                              const avg = completed.length > 0
                                ? Math.round(completed.reduce((acc, curr) => acc + (curr.result?.overallScore || 0), 0) / completed.length)
                                : 0;
                              const zeroWarnings = degreeCandidates.filter(c => (c.warningCount || 0) === 0).length;
                              const compliance = degreeCandidates.length > 0 ? Math.round((zeroWarnings / degreeCandidates.length) * 100) : 100;

                              return (
                                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3 text-slate-800 font-bold">{deg}</td>
                                  <td className="py-3 text-center text-slate-500">{completed.length}</td>
                                  <td className="py-3 text-right">
                                    <span className="font-bold text-slate-800">{avg || "—"}</span>
                                    {avg > 0 && <span className="text-slate-400 text-[10px]">/100</span>}
                                  </td>
                                  <td className="py-3 text-right text-emerald-600 font-bold">{compliance}%</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  2. CANDIDATES TAB
              ───────────────────────────────────────────────────────────── */}
              {activeTab === "candidates" && (
                <>
                  {/* Search and Filters Block */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    
                    {/* Row 1: Search and Export */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="relative flex items-center w-full md:max-w-md">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search candidates by name or corporate email..."
                          className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-blue-100/50"
                        />
                      </div>
                      
                      <button
                        onClick={exportAllCandidatesToExcel}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold py-3 px-6 rounded-xl transition-all text-xs select-none cursor-pointer"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Export Filtered Cohort (.xlsx)</span>
                      </button>
                    </div>

                    {/* Row 2: Secondary Dropdown Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2 border-t border-slate-200/60">
                      
                      {/* Readiness */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Readiness Level</label>
                        <div className="relative">
                          <select
                            value={filterReadiness}
                            onChange={(e) => setFilterReadiness(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none appearance-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="All">All Levels</option>
                            <option value="Industry Ready">Industry Ready</option>
                            <option value="Industry Ready Foundation">Industry Ready Foundation</option>
                            <option value="Emerging Professional">Emerging Professional</option>
                            <option value="Explorer">Explorer</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Degree Stream */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Degree Stream</label>
                        <div className="relative">
                          <select
                            value={filterDegree}
                            onChange={(e) => setFilterDegree(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none appearance-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="All">All Degrees</option>
                            {metrics.allDegrees.map((d, idx) => (
                              <option key={idx} value={d}>{d}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attempt Status</label>
                        <div className="relative">
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none appearance-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="All">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="TERMINATED">Terminated</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Archetype */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Candidate Archetype</label>
                        <div className="relative">
                          <select
                            value={filterArchetype}
                            onChange={(e) => setFilterArchetype(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none appearance-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="All">All Archetypes</option>
                            {metrics.allArchetypes.map((a: any, idx) => (
                              <option key={idx} value={a}>{a}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Role */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Assessment Role</label>
                        <div className="relative">
                          <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold outline-none appearance-none cursor-pointer focus:border-blue-500"
                          >
                            <option value="All">All Roles</option>
                            <option value="data-scientist">Data Scientist</option>
                            <option value="sde">Software Engineer (SDE)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Candidates Data Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-900 tracking-tight">Candidates ({filteredCandidates.length})</h4>
                      
                      {/* Sorting controls */}
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span>Sort By:</span>
                        <select
                          value={sortBy}
                          onChange={(e: any) => setSortBy(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-750 outline-none text-xs cursor-pointer"
                        >
                          <option value="date">Date Started</option>
                          <option value="score">Overall Score</option>
                          <option value="warnings">Warnings</option>
                          <option value="name">Name</option>
                        </select>
                        <button
                          onClick={() => setSortOrder(curr => curr === "asc" ? "desc" : "asc")}
                          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            <th className="px-6 py-4">Name / Contact</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Degree / Status</th>
                            <th className="px-6 py-4 text-center">Age</th>
                            <th className="px-6 py-4">Gender</th>
                            <th className="px-6 py-4">Career & Skills</th>
                            <th className="px-6 py-4">Self-Assessment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Time Taken</th>
                            <th className="px-6 py-4 text-center">Reattempts</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4">Readiness Level</th>
                            <th className="px-6 py-4 text-center">Security Alerts</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                          {filteredCandidates.length === 0 ? (
                            <tr>
                              <td colSpan={14} className="px-6 py-12 text-center text-slate-500 font-bold">
                                No candidates match the applied filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredCandidates.map((c, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="text-slate-800 font-extrabold text-sm">{c.name}</div>
                                  <div className="text-slate-500 font-medium text-xs mt-0.5">{c.email}</div>
                                  {c.phone && <div className="text-slate-400 font-mono text-[10px] mt-0.5">{c.phone}</div>}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                    c.role === "sde" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                                    "bg-blue-50 text-blue-600 border border-blue-100"
                                  }`}>
                                    {c.role === "sde" ? "SDE" : "Data Scientist"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-850 font-bold text-sm">{c.degree}</div>
                                  <div className="text-slate-500 font-medium text-xs mt-0.5">{c.academicStatus}</div>
                                </td>
                                <td className="px-6 py-4 text-center text-slate-600">{c.age ?? "—"}</td>
                                <td className="px-6 py-4 text-slate-600">{c.gender ?? "—"}</td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-850 font-bold text-sm">{c.careerInterest || "—"}</div>
                                  <div className="flex flex-wrap gap-1 mt-1.5 max-w-[180px]">
                                    {c.skills && c.skills.length > 0 ? (
                                      c.skills.slice(0, 3).map((skill: string, sIdx: number) => (
                                        <span key={sIdx} className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200/40">
                                          {skill}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-400 text-[10px] font-bold">—</span>
                                    )}
                                    {c.skills && c.skills.length > 3 && (
                                      <span className="text-slate-400 text-[9px] font-bold self-center">
                                        +{c.skills.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-600 font-medium text-xs">Familiarity: <strong className="text-slate-800">{c.dsFamiliarity}/100</strong></div>
                                  <div className="text-slate-500 font-medium text-[10.5px] mt-0.5">Comfort: <strong className="text-slate-800">{c.dataComfort}/100</strong></div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                                    c.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                    c.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                    "bg-rose-50 text-rose-600 border border-rose-100"
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-slate-800 font-extrabold text-sm">{formatTimeTaken(c.timeTaken, c.status)}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-slate-700 font-bold bg-slate-100 border border-slate-200/50 rounded px-2.5 py-0.5">
                                    {c.reattemptCount || 0}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {c.result?.overallScore !== undefined ? (
                                    <div>
                                      <span className="text-slate-800 font-extrabold text-sm">{c.result.overallScore}</span>
                                      <span className="text-slate-400 text-[10px]">/100</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-bold">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  {c.result?.readinessLevel ? (
                                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase ${
                                      c.result.readinessLevel === "Industry Ready" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                      c.result.readinessLevel.includes("Foundation") ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                      c.result.readinessLevel.includes("Emerging") ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                      "bg-rose-50 text-rose-600 border border-rose-100"
                                    }`}>
                                      {c.result.readinessLevel}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-bold">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  {c.warningCount > 0 ? (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      c.warningCount >= 3 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-amber-50 text-amber-600 border border-amber-100"
                                    }`}>
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                      <span>{c.warningCount} Warnings</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 font-bold">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => setSelectedCandidate(c)}
                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold transition-all text-xs select-none cursor-pointer bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl hover:bg-slate-100"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Analyze</span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  3. COMPETENCY MATRIX TAB
              ───────────────────────────────────────────────────────────── */}
              {activeTab === "competencies" && (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Aggregated Radar */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight">Aggregated Cohort Competencies</h4>
                        <p className="text-xs text-slate-500 font-medium mb-6">Radar evaluation of the 8 core competencies mapped by Sona Scale</p>
                      </div>

                      <div className="h-80 w-full flex items-center justify-center">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartsData.competencyRadarData}>
                              <PolarGrid stroke="#cbd5e1" />
                              <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} fontWeight="bold" />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                              <Radar name="Cohort Average" dataKey="average" stroke="#2563FF" fill="#2563FF" fillOpacity={0.25} />
                              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                            </RadarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    {/* Competency Gap Analysis */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-base font-black text-slate-900 tracking-tight">Competency Gap Rankings</h4>
                        <p className="text-xs text-slate-500 font-medium mb-6">Cohort averages ranked from strongest capability to largest training gap</p>
                      </div>

                      <div className="h-80 w-full">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartsData.competencyGapData}
                              layout="vertical"
                              margin={{ top: 5, right: 10, left: 40, bottom: 5 }}
                            >
                              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                              <XAxis type="number" stroke="#64748b" fontSize={10} fontWeight="bold" domain={[0, 100]} />
                              <YAxis dataKey="competency" type="category" stroke="#64748b" fontSize={10} fontWeight="bold" width={110} />
                              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                              <Bar dataKey="score" name="Avg Skill Score" fill="#6C3DFF" radius={[0, 4, 4, 0]}>
                                {chartsData.competencyGapData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.score >= 70 ? "#10B981" : entry.score >= 55 ? "#6C3DFF" : "#F59E0B"} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Detailed Gap Insights & Interventions Recommendations */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-base font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      <span>Cohort Training & Hiring Insights</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Top Strengths card */}
                      <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200/50">
                        <h5 className="text-sm font-black text-emerald-700 uppercase tracking-wider mb-2.5">Key Capability Core</h5>
                        <p className="text-slate-700 text-xs leading-relaxed mb-4">
                          The cohort shows high proficiency in <strong>{chartsData.competencyGapData[0]?.competency}</strong> and <strong>{chartsData.competencyGapData[1]?.competency}</strong>. 
                          These candidates are highly skilled in quantitative validation and reading complex information layouts.
                        </p>
                        <ul className="text-xs font-bold text-slate-500 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Highly ready for quantitative dashboard reporting</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Strong analytical grounding in validating raw metrics</span>
                          </li>
                        </ul>
                      </div>

                      {/* Top weaknesses card */}
                      <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-200/50">
                        <h5 className="text-sm font-black text-rose-700 uppercase tracking-wider mb-2.5">Primary Skill Gap</h5>
                        <p className="text-slate-700 text-xs leading-relaxed mb-4">
                          The largest skill deficit resides in <strong>{chartsData.competencyGapData[chartsData.competencyGapData.length - 1]?.competency}</strong> and <strong>{chartsData.competencyGapData[chartsData.competencyGapData.length - 2]?.competency}</strong>.
                          We recommend integrating additional business context or communication workshops in the curriculum.
                        </p>
                        <ul className="text-xs font-bold text-slate-500 space-y-2">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Focus training on connecting data findings to revenue impact</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            <span>Integrate stakeholder roleplay presentation briefs</span>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </>
              )}



            </motion.div>
          )}

        </div>
      </main>

      {/* ── CANDIDATE ANALYTICS DETAIL MODAL OVERLAY ── */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
            
            {/* Modal Backdrop closer click */}
            <div className="absolute inset-0" onClick={() => setSelectedCandidate(null)} />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-w-4xl bg-white border-l border-slate-200 shadow-2xl h-full flex flex-col justify-between z-10 overflow-hidden"
            >
              {/* Header drawer controls */}
              <div className="h-20 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    {selectedCandidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{selectedCandidate.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedCandidate.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  
                  {/* XLS Export */}
                  <button
                    onClick={() => exportSingleCandidateToExcel(selectedCandidate)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer select-none"
                    title="Export candidate response log as XLS spreadsheet"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  </button>

                  {/* PDF Report Export */}
                  <button
                    onClick={() => exportSingleCandidateToPDF(selectedCandidate)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer select-none"
                    title="Generate candidate PDF profile report"
                  >
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </button>

                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer select-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable contents drawer */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                
                {/* 2-column split (Overview details + radar competencies) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Column 1: Info and scores */}
                  <div className="md:col-span-7 space-y-6">
                    
                    {/* Academic profile card */}
                    <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Candidate Intake Profile</h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-500 block mb-0.5">Degree Stream</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.degree}</span>
                        </div>
                        
                        <div>
                          <span className="text-slate-500 block mb-0.5">Academic Status</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.academicStatus}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Age</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.age ?? "N/A"}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Gender</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.gender ?? "N/A"}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Career Interest</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.careerInterest}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Phone Number</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.phone}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Time Taken</span>
                          <span className="text-slate-800 font-bold">{formatTimeTaken(selectedCandidate.timeTaken, selectedCandidate.status)}</span>
                        </div>

                        <div>
                          <span className="text-slate-500 block mb-0.5">Reattempts</span>
                          <span className="text-slate-800 font-bold">{selectedCandidate.reattemptCount || 0}</span>
                        </div>
                      </div>

                      {/* DS Sliders */}
                      <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-200 text-xs font-bold">
                        <div>
                          <span className="text-slate-500 block mb-1">DS Familiarity ({selectedCandidate.dsFamiliarity}/100)</span>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${selectedCandidate.dsFamiliarity}%` }} />
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-slate-500 block mb-1">Data Comfort ({selectedCandidate.dataComfort}/100)</span>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${selectedCandidate.dataComfort}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Result details */}
                    <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Overall Simulation Results</h4>
                      
                      {selectedCandidate.result ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Calculated Overall Score</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{selectedCandidate.status === "COMPLETED" ? "Successful Evaluation" : "Terminated Score"}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl font-black text-slate-900">{selectedCandidate.result.overallScore}</span>
                              <span className="text-slate-400 font-black ml-1">/100</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center py-2 border-y border-slate-250/60">
                            <div>
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Readiness Classification</p>
                              <span className={`text-[10px] font-black uppercase bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded`}>
                                {selectedCandidate.result.readinessLevel}
                              </span>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Student Archetype</p>
                              <span className="text-slate-800 text-xs font-bold">{selectedCandidate.result.archetype}</span>
                            </div>
                          </div>

                          {/* Strengths & Weaknesses */}
                          <div className="space-y-3.5">
                            <div>
                              <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider block mb-1">Primary Strength</span>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {selectedCandidate.result.strengths?.[0] || "General analytics competency demonstrated."}
                              </p>
                            </div>

                            <div>
                              <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider block mb-1">Primary Improvement Gap</span>
                              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                {selectedCandidate.result.improvements?.[0] || "No critical training gaps recorded."}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-505 font-bold">This simulation is currently in progress. Score reports will generate upon candidate completion.</p>
                      )}
                    </div>

                  </div>

                  {/* Column 2: Specific Candidate radar compared against averages */}
                  <div className="md:col-span-5 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[320px]">
                    <div>
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Candidate Competency Mapping</h4>
                      <p className="text-[10px] text-slate-400 font-bold">Comparison of candidate (Purple) vs Cohort Average (Gray)</p>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center my-3">
                      {mounted && selectedCandidate.result?.competencyScores ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={
                            Object.entries(selectedCandidate.result.competencyScores)
                              .filter(([key]) => ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"].includes(key))
                              .map(([key, score]: any) => {
                                // Find cohort average from charts data
                                const radarAvg = chartsData.competencyRadarData.find(r => r.subject === competencyLabels[key] || r.subject === key);
                                return {
                                  subject: competencyLabels[key] || key,
                                  candidate: score,
                                  average: radarAvg ? radarAvg.average : 60,
                                };
                              })
                          }>
                            <PolarGrid stroke="#cbd5e1" />
                            <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} fontWeight="bold" />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                            <Radar name="Candidate" dataKey="candidate" stroke="#6C3DFF" fill="#6C3DFF" fillOpacity={0.25} />
                            <Radar name="Cohort Average" dataKey="average" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                            <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "12px", color: "#0f172a" }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-xs text-slate-500 font-bold text-center">No scores available to chart.</p>
                      )}
                    </div>

                    <div className="flex justify-center gap-4 text-[10px] font-black uppercase text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-purple" />
                        <span>Candidate</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>Cohort Avg</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Integrity Log Card (Drawer) */}
                <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Security Integrity Log</span>
                  </h4>
                  
                  {selectedCandidate.warningEvents && selectedCandidate.warningEvents.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-bold">Total security alerts triggered during attempt: <strong className="text-amber-700">{selectedCandidate.warningCount}</strong></p>
                      <div className="space-y-2">
                        {selectedCandidate.warningEvents.map((ev: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-white border border-slate-200 text-xs font-semibold rounded-lg flex justify-between items-center">
                            <span className="text-amber-700">{ev.reason}</span>
                            <span className="text-slate-450 text-[10px] font-sans">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Clean Proctoring Audit. Session compliant.</span>
                    </p>
                  )}
                </div>

                {/* Reviewer Note text box */}
                <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Reviewer Notes (Persistent)</span>
                    {noteSaved && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Notes Saved</span>
                      </span>
                    )}
                  </h4>
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter academic review, competency notes or hiring comments for this candidate..."
                    className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-450 outline-none transition-all resize-none font-semibold focus:ring-4 focus:ring-blue-100/50"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={saveCandidateNotes}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer select-none shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Notes</span>
                    </button>
                  </div>
                </div>

                {/* Stage-by-Stage Marks Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 mb-1">
                    <MdOutlineScoreboard className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Stage-by-Stage Scoring Breakdown</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mb-3">Detailed marks, reasoning rationale and competency targets for each completed stage.</p>

                  {selectedCandidate.responses && selectedCandidate.responses.length > 0 ? (
                    <div className="space-y-4">
                      {selectedCandidate.responses.map((r: any, idx: number) => {
                        const pct = r.maxScore > 0 ? Math.round((r.scoreEarned / r.maxScore) * 100) : 0;
                        const isStrong = pct >= 75;
                        const isMid = pct >= 40 && pct < 75;
                        const isLow = pct < 40;

                        // Derive scoring rationale
                        const getRationale = () => {
                          const taskId = r.taskId || "";
                          if (taskId === "sprint-planning") {
                            return pct >= 75
                              ? "Excellent backlog prioritization. Critical P0 bug (FIN-2847) was prioritized first, and integration testing tasks were placed appropriately."
                              : "Suboptimal sprint ordering. P0 bug was not prioritized first, or non-blocking documentation was prioritized ahead of critical fixes.";
                          }
                          if (taskId === "webhook-fix") {
                            return pct >= 100
                              ? "Optimal webhook delay timeout chosen (5000ms). Safely within Stripe's response window."
                              : "Suboptimal delay timeout selected. Choice could lead to webhook queue timeouts or Stripe retry lockouts.";
                          }
                          if (taskId === "root-cause") {
                            return pct >= 100
                              ? "Correct root cause identified: Stripe webhook signature verify fails due to payload mismatch (rc-a)."
                              : "Incorrect root cause hypothesis. Log evidence and metrics did not support the selected cause.";
                          }
                          if (taskId === "pr-submission") {
                            return pct >= 80
                              ? "Comprehensive PR documentation. Thoroughly covered changes, testing strategies, and risk evaluation."
                              : "PR documentation lacked key sections or was too short to guide code reviews.";
                          }
                          if (taskId === "slack-update") {
                            return pct >= 100
                              ? "Clear and actionable stakeholder Slack alert. Provided resolution status and service health updates."
                              : "Stakeholder update was too brief or lacked clear resolution context.";
                          }
                          if (taskId === "sprint-retro") {
                            return pct >= 100
                              ? "High-quality retrospective. Identified specific technical debt and proposed concrete improvements."
                              : "Retrospective notes lacked technical depth or actionable improvement points.";
                          }

                          const type = r.interactionType || "";
                          if (pct === 0) return "No credit awarded — response was empty, irrelevant, or failed quality check.";
                          if (type === "SingleSelect") {
                            return pct >= 70
                              ? "Correct option selected — full base marks awarded."
                              : "Incorrect option selected — no base marks; bonus modifiers applied.";
                          }
                          if (type === "MultiSelect") {
                            return pct >= 80
                              ? "All correct options selected with no wrong choices — full marks + depth bonus."
                              : pct >= 50
                              ? "Partially correct — some correct options chosen; wrong selections reduced score."
                              : "Mostly incorrect selections or significant wrong choices penalized.";
                          }
                          if (type === "Ranking") {
                            return pct >= 80
                              ? "Near-perfect or perfect ranking order — high weighted position score achieved."
                              : pct >= 50
                              ? "Partially correct ranking — some positions matched; weighted partial credit applied."
                              : "Ranking order significantly off — low weighted match score.";
                          }
                          if (type === "Slider") {
                            return pct >= 65
                              ? "Slider value placed within the correct target range — close to optimal center."
                              : pct >= 40
                              ? "Slider value near but outside the ideal range — partial decay score applied."
                              : "Slider value placed far from target range — high decay penalty applied.";
                          }
                          if (type === "ShortText") {
                            return pct >= 70
                              ? "Free-text response demonstrated strong keyword alignment and analytical depth."
                              : pct >= 40
                              ? "Response showed partial keyword coverage — moderate score by AI or keyword evaluator."
                              : "Response lacked key terminology or depth — low score assigned by grader.";
                          }
                          return pct >= 70
                            ? "Strong response — high marks awarded."
                            : pct >= 40
                            ? "Moderate response — partial marks awarded."
                            : "Weak response — low marks awarded.";
                        };

                        // Task type icon
                        const typeIcon = () => {
                          const t = r.interactionType || "";
                          if (t === "SingleSelect") return <BsToggle2On className="w-3 h-3" />;
                          if (t === "MultiSelect") return <BsListCheck className="w-3 h-3" />;
                          if (t === "Ranking") return <BsSortDown className="w-3 h-3" />;
                          if (t === "Slider") return <BsSliders2 className="w-3 h-3" />;
                          if (t === "ShortText") return <BsTextParagraph className="w-3 h-3" />;
                          return <BsBarChartFill className="w-3 h-3" />;
                        };

                        return (
                          <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            {/* Stage Header */}
                            <div className={`px-5 py-4 border-b flex items-center justify-between ${
                              isStrong ? "bg-blue-50/60 border-blue-100" :
                              isMid ? "bg-amber-50/50 border-amber-100" :
                              "bg-rose-50/40 border-rose-100"
                            }`}>
                              <div className="flex items-center gap-3">
                                {/* Stage badge */}
                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/70 flex items-center justify-center shadow-sm text-[11px] font-black text-blue-600">
                                  {idx + 1}
                                </div>
                                <div>
                                  <h5 className="text-sm font-black text-slate-800 leading-tight">
                                    {r.selectedOption?.title || r.missionId || `Stage ${idx + 1}`}
                                  </h5>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/60 text-slate-500 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                      {typeIcon()}
                                      {r.interactionType || "Task"}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-semibold">
                                      {r.missionId === "churn-spike-newcomer" ? "Churn Spike (Newcomer)" : r.missionId}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Score pill */}
                              <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-baseline gap-0.5">
                                  <span className={`text-xl font-black ${
                                    isStrong ? "text-blue-600" : isMid ? "text-amber-600" : "text-rose-600"
                                  }`}>{r.scoreEarned}</span>
                                  <span className="text-slate-400 text-[11px] font-bold">/{r.maxScore}</span>
                                </div>
                                {/* Score status icon */}
                                <div className="flex items-center gap-1">
                                  {isStrong ? (
                                    <BsCheckCircleFill className="w-3.5 h-3.5 text-blue-500" />
                                  ) : isMid ? (
                                    <BsDashCircleFill className="w-3.5 h-3.5 text-amber-500" />
                                  ) : (
                                    <BsXCircleFill className="w-3.5 h-3.5 text-rose-400" />
                                  )}
                                  <span className={`text-[10px] font-black ${
                                    isStrong ? "text-blue-500" : isMid ? "text-amber-500" : "text-rose-500"
                                  }`}>{pct}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                              {/* Score bar */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5 text-[10px] font-bold text-slate-500">
                                  <span>Score Distribution</span>
                                  <span>{r.scoreEarned} / {r.maxScore} pts</span>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                                      isStrong
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                        : isMid
                                        ? "bg-gradient-to-r from-amber-400 to-orange-400"
                                        : "bg-gradient-to-r from-rose-400 to-red-500"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>

                              {/* Scoring Reason */}
                              <div className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                                isStrong ? "bg-blue-50/50 border-blue-100" :
                                isMid ? "bg-amber-50/50 border-amber-100" :
                                "bg-rose-50/40 border-rose-100"
                              }`}>
                                <HiOutlineLightBulb className={`w-4 h-4 mt-0.5 shrink-0 ${
                                  isStrong ? "text-blue-500" : isMid ? "text-amber-500" : "text-rose-500"
                                }`} />
                                <div>
                                  <p className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${
                                    isStrong ? "text-blue-600" : isMid ? "text-amber-600" : "text-rose-600"
                                  }`}>SCORING RATIONALE</p>
                                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {getRationale()}
                                  </p>
                                </div>
                              </div>

                              {/* Candidate Objective + Response */}
                              {(r.selectedOption?.description || r.textValue) && (
                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2.5">
                                  {r.selectedOption?.description && (
                                    <div>
                                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Task Objective</span>
                                      <p className="text-slate-700 font-medium leading-relaxed">{r.selectedOption.description}</p>
                                    </div>
                                  )}
                                  {r.textValue && (
                                    <div className={r.selectedOption?.description ? "pt-2 border-t border-slate-200" : ""}>
                                      <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Candidate Free-text Response</span>
                                      <p className="text-slate-700 font-medium font-sans italic leading-relaxed">"{r.textValue}"</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Competencies targeted */}
                              {r.competenciesHit && r.competenciesHit.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Competencies Evaluated</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {r.competenciesHit.map((comp: string, cIdx: number) => (
                                      <span
                                        key={cIdx}
                                        className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                                      >
                                        <HiOutlineSparkles className="w-2.5 h-2.5" />
                                        {competencyLabels[comp] || comp}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                      <MdOutlineScoreboard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-bold">This simulation attempt has no responses logged yet.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer Drawer controls */}
              <div className="h-20 bg-slate-55 border-t border-slate-200 px-8 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer select-none"
                >
                  Close Drawer
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── HIDDEN PRINTABLE CONTAINER FOR SINGLE PDF REPORT GENERATION ── */}
      {selectedCandidate && (
        <div 
          id="pdf-report-canvas" 
          style={{ display: "none", width: "800px", padding: "40px", backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "sans-serif" }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #cbd5e1", paddingBottom: "20px", marginBottom: "30px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "900", margin: "0", color: "#0f172a" }}>SONA SCALE</h1>
              <p style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "2px", margin: "5px 0 0 0" }}>Candidate Analytical Profile</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0" }}>POWERED BY HIRESAPIEN</p>
              <p style={{ fontSize: "10px", color: "#64748b", margin: "2px 0 0 0" }}>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Profile overview */}
          <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "16px", color: "#0284c7", margin: "0 0 15px 0", textTransform: "uppercase" }}>Candidate Details</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "13px" }}>
              <div><span style={{ color: "#475569" }}>Name:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.name}</strong></div>
              <div><span style={{ color: "#475569" }}>Email:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.email}</strong></div>
              <div><span style={{ color: "#475569" }}>Degree:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.degree}</strong></div>
              <div><span style={{ color: "#475569" }}>Phone:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.phone}</strong></div>
              <div><span style={{ color: "#475569" }}>Career Interest:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.careerInterest}</strong></div>
              <div><span style={{ color: "#475569" }}>Status:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.status}</strong></div>
              <div><span style={{ color: "#475569" }}>Time Taken:</span> <strong style={{ color: "#0f172a" }}>{formatTimeTaken(selectedCandidate.timeTaken, selectedCandidate.status)}</strong></div>
              <div><span style={{ color: "#475569" }}>Reattempts:</span> <strong style={{ color: "#0f172a" }}>{selectedCandidate.reattemptCount || 0}</strong></div>
            </div>
          </div>

          {/* Scores Overview */}
          {selectedCandidate.result && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "30px", marginBottom: "30px" }}>
              
              {/* Score card */}
              <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Overall Score</span>
                <div style={{ fontSize: "64px", fontWeight: "900", color: "#0f172a", lineHeight: "1", margin: "10px 0" }}>
                  {selectedCandidate.result.overallScore}
                  <span style={{ fontSize: "20px", color: "#94a3b8" }}>/100</span>
                </div>
                <div style={{ fontSize: "12px", color: "#0284c7", fontWeight: "bold", textTransform: "uppercase" }}>
                  {selectedCandidate.result.readinessLevel}
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "10px" }}>
                  Archetype: {selectedCandidate.result.archetype}
                </div>
              </div>

              {/* Competency scores list */}
              <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: "14px", color: "#0284c7", margin: "0 0 15px 0", textTransform: "uppercase" }}>Competency Scores</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.entries(selectedCandidate.result.competencyScores)
                    .filter(([key]) => ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"].includes(key))
                    .map(([key, score]: any, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                      <span style={{ color: "#475569" }}>{competencyLabels[key] || key}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "100px", backgroundColor: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ backgroundColor: "#3b82f6", height: "100%", width: `${score}%` }} />
                        </div>
                        <strong style={{ color: "#0f172a", width: "30px", textAlign: "right" }}>{score}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Strengths / Improvements */}
          {selectedCandidate.result && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
              <div style={{ backgroundColor: "#f0fdf4", padding: "15px", borderRadius: "10px", border: "1px solid #bbf7d0", fontSize: "12px" }}>
                <strong style={{ color: "#166534", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Primary Strength</strong>
                <p style={{ margin: "0", color: "#1e293b" }}>{selectedCandidate.result.strengths?.[0]}</p>
              </div>
              
              <div style={{ backgroundColor: "#fef2f2", padding: "15px", borderRadius: "10px", border: "1px solid #fecaca", fontSize: "12px" }}>
                <strong style={{ color: "#991b1b", textTransform: "uppercase", display: "block", marginBottom: "5px" }}>Recommended Improvement</strong>
                <p style={{ margin: "0", color: "#1e293b" }}>{selectedCandidate.result.improvements?.[0]}</p>
              </div>
            </div>
          )}

          {/* Proctoring */}
          <div style={{ backgroundColor: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", fontSize: "12px" }}>
            <h3 style={{ fontSize: "14px", color: "#b45309", margin: "0 0 10px 0", textTransform: "uppercase" }}>Security Proctor Audit</h3>
            {selectedCandidate.warningCount > 0 ? (
              <p style={{ margin: "0 0 10px 0", color: "#b91c1c" }}>Warning logs detected: <strong>{selectedCandidate.warningCount} proctor warnings</strong> during simulation session.</p>
            ) : (
              <p style={{ margin: "0", color: "#166534" }}>Compliant session. Zero warnings or integrity notifications logged during evaluation.</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedCandidate.warningEvents && selectedCandidate.warningEvents.map((ev: any, idx: number) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", backgroundColor: "#f8fafc", borderRadius: "6px" }}>
                  <span style={{ color: "#991b1b" }}>{ev.reason}</span>
                  <span style={{ color: "#64748b" }}>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "20px", marginTop: "40px", textAlign: "center", fontSize: "11px", color: "#64748b" }}>
            This evaluation is processed dynamically under Sona Scale metrics. All scores are aggregated on performance calculations.
          </div>
        </div>
      )}

    </div>
  );
}
