export const BRANDING = {
  appName: "HireSapien",
  companyName: "Fintra",
  companyContext: "Fintra is one of India's growing e-commerce platforms. Over the past quarter, revenue has declined by 18%, while customer complaints have increased by 12%. You are a Junior Data Analyst working under Priya Sharma (Analytics Lead). Your mission is to discover what's happening before the Executive Board meeting.",
  labName: "Fintra Analytics Lab",
  teamName: "Fintra Analytics Team",
  storageKeys: {
    candidate: "hiresapienCandidate",
    candidateProfile: "hiresapienCandidateProfile",
    progress: "hiresapienProgress",
    warningCount: "hiresapienWarningCount",
    profileId: "hiresapienProfileId",
    attemptId: "simulationAttemptId"
  }
};

/**
 * Replaces placeholder company/app names in any text with the configured branding parameters.
 */
export function formatBranding(text: string): string {
  if (!text) return text;
  return text
    .replace(/Fintra/g, BRANDING.companyName)
    .replace(/FINTRA/g, BRANDING.companyName.toUpperCase())
    .replace(/HireSapien/g, BRANDING.appName)
    .replace(/HIRESAPIEN/g, BRANDING.appName.toUpperCase());
}

import rawData from "./simulation-data.json";
export function getBrandedSimulationData(): typeof rawData {
  const serialized = JSON.stringify(rawData);
  const branded = formatBranding(serialized);
  return JSON.parse(branded);
}
