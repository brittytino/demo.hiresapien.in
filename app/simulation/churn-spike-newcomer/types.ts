export interface ToastItem {
  title?: string;
  text: string;
  icon: "spark" | "lock" | "lightbulb" | "clock";
  duration: number;
}

export interface StageScores {
  investigation: number;
  interpretation: number;
  decisionQuality: number;
  businessAwareness: number;
  communication: number;
}

export interface InvestigationLog {
  panelsOpened: string[];
  filtersApplied: string[];
  ticketsOverlaid: boolean;
  smbSelected: boolean;
  seaSelected: boolean;
  layer1Time: number | null;
  layer2Time: number | null;
  ahaCombo: boolean;
  stageStartedAt: number;
}

export interface StageLogs {
  investigation: InvestigationLog;
  interpretationElement: string | null;
  interpretationText: string;
  budget: Record<string, number>;
  stakeholderBranch: string | null; // e.g. balanced, product, support, discount
  boardUpdate: string;
}
