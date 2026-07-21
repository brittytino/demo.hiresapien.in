import { BRANDING } from "@/lib/branding";

export const FINTRA_SCENARIO = {
  company: BRANDING.companyName,
  role: "Data Scientist",
  vpName: "Priya Nair",
  vpTitle: "VP of Customer Success",
  vpMessage: {
    time: "2:47 PM",
    text: "We just pulled the weekly numbers and churn jumped 14% this week. The board call is at 3:00. I need to know why and what we do about it before then. Can you take a look and get back to me?",
  },
};

// Stage 1: 12-week churn trend data
export const CHURN_TREND_DATA = [
  { week: "Wk 1",  churnRate: 2.1, ticketVolume: 120 },
  { week: "Wk 2",  churnRate: 2.3, ticketVolume: 135 },
  { week: "Wk 3",  churnRate: 2.0, ticketVolume: 118 },
  { week: "Wk 4",  churnRate: 2.4, ticketVolume: 142 },
  { week: "Wk 5",  churnRate: 2.2, ticketVolume: 128 },
  { week: "Wk 6",  churnRate: 2.5, ticketVolume: 155 },
  { week: "Wk 7",  churnRate: 2.3, ticketVolume: 140 },
  { week: "Wk 8",  churnRate: 2.6, ticketVolume: 162 },
  { week: "Wk 9",  churnRate: 2.4, ticketVolume: 148 },
  { week: "Wk 10", churnRate: 2.7, ticketVolume: 175 },
  { week: "Wk 11", churnRate: 2.5, ticketVolume: 193 },
  { week: "Wk 12", churnRate: 4.2, ticketVolume: 587 },
];

export const CHURN_BY_SEGMENT: Record<string, Record<string, number>> = {
  SMB: { India: 2.1, SEA: 7.8, EU: 2.3, US: 2.0 },
  "Mid-market": { India: 1.8, SEA: 2.2, EU: 1.9, US: 1.7 },
  Enterprise: { India: 0.9, SEA: 1.1, EU: 0.8, US: 1.0 },
};

export const TICKET_SPIKE_DATA: Record<string, Record<string, number>> = {
  SMB: { India: 145, SEA: 1840, EU: 162, US: 138 },
  "Mid-market": { India: 89, SEA: 102, EU: 94, US: 87 },
  Enterprise: { India: 34, SEA: 41, EU: 38, US: 29 },
};

export const TOTAL_BUDGET = 1_000_000;

export const BUDGET_OPTIONS = [
  {
    id: "support_surge",
    label: "Emergency Support Surge",
    description: "Add support staff for SEA/SMB accounts for 2 weeks",
  },
  {
    id: "retention_discount",
    label: "Proactive Retention Discount",
    description: "Discount/retention offer to affected accounts",
  },
  {
    id: "engineering_hotfix",
    label: "Engineering Hotfix + Comms",
    description: "Fix the payment gateway bug + status-page update",
  },
];

export const CONSEQUENCE = {
  headline: "Two weeks later…",
  body: "The support surge reduced SEA/SMB churn by 6%. Engineering confirmed and patched a payment-gateway timeout bug affecting SEA users. The status-page update restored confidence in 340 at-risk accounts.",
};

export const STAKEHOLDER_BRANCHES = {
  under_support: {
    name: "Arjun Mehta",
    title: "Head of Sales, APAC",
    message: "Hey — SEA renewals are stacking up this quarter. I heard we had a rough patch with that segment. Did we move fast enough on support capacity? Some of these accounts were flagging issues for days before anyone picked up the ticket.",
    principle: "When the leading indicator is a support-ticket spike, responding to customers is the first dollar spent — not the last. Sales pressure is the downstream consequence of a support gap left open too long.",
  },
  over_discount: {
    name: "Meera Iyer",
    title: "VP Finance",
    message: "I am looking at the retention discount line and it is a big number for a segment that represents 8% of total revenue. Walk me through the reasoning — specifically why discounts rather than fixing whatever broke?",
    principle: "Discounts are a demand signal. If customers left because of a broken product, discounting to retain them reduces margin on accounts that will churn again when the product breaks. Match the fix to the finding.",
  },
  balanced: {
    name: "Priya Nair",
    title: "VP of Customer Success",
    message: "This lines up with what Engineering just confirmed — it was a gateway timeout bug in the SEA cluster. Good call on the support surge, it held the line while the patch went out. Can you put together a 3-line summary I can read to the board at 3:00?",
    principle: "A decision is only as good as its alignment with your diagnosis. When the support surge, engineering fix, and restrained discounting all follow from the SEA/SMB support spike, the board sees a data-driven response — not a guess.",
  },
};

export const INTERPRETATION_KEYWORDS = ["smb", "sea", "support", "ticket", "outage", "gateway", "payment", "timeout"];

export const BOARD_UPDATE_RUBRIC = {
  what: ["churn", "spike", "14%", "jumped", "increased"],
  why: ["smb", "sea", "support", "outage", "gateway", "bug", "timeout", "ticket"],
  action: ["surge", "hotfix", "patch", "fix", "engineering", "support", "reduce"],
};
