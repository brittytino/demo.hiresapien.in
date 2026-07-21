/**
 * HireSapien v2.1 — SDE Workspace Configuration
 * Defines CORE vs AMBIENT surfaces and the fake codebase for the implementation stage.
 */

// ── Tool Surface Configuration ──────────────────────────────────────────

export type ToolId = "jira" | "vscode" | "github" | "slack" | "grafana" | "notion";
export type ToolTag = "CORE" | "AMBIENT";

export interface ToolConfig {
  id: ToolId;
  label: string;
  tag: ToolTag;
  icon: string;         // icon name from lucide-react
  shortcut: string;
  description: string;
  notificationCount?: number;
}

export const SDE_TOOLS: ToolConfig[] = [
  { id: "jira",    label: "Jira",    tag: "CORE",    icon: "LayoutGrid",   shortcut: "1", description: "Sprint board & task tracking",   notificationCount: 1 },
  { id: "vscode",  label: "VS Code", tag: "CORE",    icon: "Code2",        shortcut: "2", description: "Code editor & terminal" },
  { id: "github",  label: "GitHub",  tag: "CORE",    icon: "GitPullRequest",shortcut:"3", description: "Repository & pull requests",     notificationCount: 0 },
  { id: "slack",   label: "Slack",   tag: "AMBIENT", icon: "MessageSquare", shortcut: "4", description: "Team communication",            notificationCount: 2 },
  { id: "grafana", label: "Grafana", tag: "CORE",    icon: "BarChart2",    shortcut: "5", description: "Production metrics & alerts",   notificationCount: 1 },
  { id: "notion",  label: "Notion",  tag: "AMBIENT", icon: "BookOpen",     shortcut: "6", description: "Technical docs & runbooks" },
];

// ── Fake Codebase — payment-gateway-service ─────────────────────────────

export interface FakeFile {
  path: string;
  language: "typescript" | "json" | "yaml" | "markdown";
  content: string;
  isRelevant: boolean;   // tracked for CodebaseNavigation scoring
  isTarget: boolean;     // the file containing the bug
}

export const SDE_CODEBASE: FakeFile[] = [
  {
    path: "src/config/queue.config.ts",
    language: "typescript",
    isRelevant: true,
    isTarget: true,  // THE BUG IS HERE
    content: `// Queue Configuration — payment-gateway-service
// ⚠️  Modified in v2.14.1: Added async webhook processing

export const QUEUE_CONFIG = {
  webhook: {
    // BUG: Timeout is 5000ms (5s) but Stripe can take up to 30s
    // This causes 504s when Stripe response is slow
    timeoutMs: 5000,
    retryAttempts: 3,
    retryDelayMs: 1000,
    concurrency: 5,
  },
  payment: {
    timeoutMs: 30000,
    retryAttempts: 2,
    retryDelayMs: 2000,
    concurrency: 10,
  },
} as const;

export type QueueName = keyof typeof QUEUE_CONFIG;
`,
  },
  {
    path: "src/handlers/WebhookHandler.ts",
    language: "typescript",
    isRelevant: true,
    isTarget: false,
    content: `import { QUEUE_CONFIG } from '../config/queue.config';
import { RetryQueue } from '../queues/RetryQueue';
import { Logger } from '../utils/Logger';

export class WebhookHandler {
  private retryQueue: RetryQueue;

  constructor() {
    this.retryQueue = new RetryQueue({
      timeout: QUEUE_CONFIG.webhook.timeoutMs,
      retries: QUEUE_CONFIG.webhook.retryAttempts,
    });
  }

  async handleStripeWebhook(event: StripeEvent): Promise<void> {
    Logger.info('Processing stripe webhook', { eventType: event.type });

    return this.retryQueue.process(async () => {
      // Stripe signature verification — takes ~0-2ms
      await verifyStripeSignature(event);

      // Actual webhook processing — CAN take 8-12s for complex events
      await processWebhookEvent(event);
    });
  }
}
`,
  },
  {
    path: "src/queues/RetryQueue.ts",
    language: "typescript",
    isRelevant: true,
    isTarget: false,
    content: `export class RetryQueue {
  private timeout: number;
  private maxRetries: number;

  constructor({ timeout, retries }: { timeout: number; retries: number }) {
    this.timeout = timeout;
    this.maxRetries = retries;
  }

  async process<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await Promise.race([
          fn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(\`Timeout after \${this.timeout}ms\`)), this.timeout)
          ),
        ]);
      } catch (err) {
        lastError = err as Error;
        if (attempt < this.maxRetries) {
          await delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }
}
`,
  },
  {
    path: "src/api/checkout.ts",
    language: "typescript",
    isRelevant: false,
    isTarget: false,
    content: `// Payment checkout API handler
// Not related to the timeout issue — webhook processing is separate

export async function completeCheckout(req: Request): Promise<Response> {
  const { sessionId } = await req.json();
  const session = await PaymentSession.findById(sessionId);

  if (!session || session.status !== 'pending') {
    return Response.json({ error: 'Invalid session' }, { status: 400 });
  }

  // This calls the gateway synchronously — not via the webhook queue
  const result = await PaymentGateway.capture(session.paymentIntentId);
  await session.complete(result);

  return Response.json({ status: 'completed', transactionId: result.id });
}
`,
  },
  {
    path: "package.json",
    language: "json",
    isRelevant: false,
    isTarget: false,
    content: `{
  "name": "payment-gateway-service",
  "version": "2.14.1",
  "dependencies": {
    "stripe": "^5.1.0",
    "express": "^4.18.0",
    "mongoose": "^7.5.0",
    "winston": "^3.11.0"
  }
}
`,
  },
];

// ── Code Fix Options (for Implementation Stage) ─────────────────────────
// Candidate selects from 3 options — only one is correct.

export interface FixOption {
  id: string;
  label: string;
  diff: {
    before: string;
    after: string;
  };
  isCorrect: boolean;
  explanation: string;
  scoreImpact: number; // 0-100
}

export const SDE_FIX_OPTIONS: FixOption[] = [
  {
    id: "fix-a",
    label: "Increase webhook timeout to 35s",
    diff: {
      before: "    timeoutMs: 5000,",
      after:  "    timeoutMs: 35000,  // Stripe max timeout per docs",
    },
    isCorrect: true,
    explanation:
      "Correct. Stripe's documented maximum timeout is 30s. Setting to 35s gives a safe margin while the RetryQueue handles retries. This addresses the root cause without breaking retry logic.",
    scoreImpact: 100,
  },
  {
    id: "fix-b",
    label: "Remove the timeout entirely",
    diff: {
      before: "    timeoutMs: 5000,\n    retryAttempts: 3,",
      after:  "    // timeoutMs removed — no timeout\n    retryAttempts: 3,",
    },
    isCorrect: false,
    explanation:
      "Incorrect. Removing the timeout entirely creates a hanging request risk. If Stripe never responds, the queue worker hangs indefinitely, eventually exhausting the concurrency pool and causing a service-wide outage.",
    scoreImpact: 15,
  },
  {
    id: "fix-c",
    label: "Increase concurrency from 5 to 20",
    diff: {
      before: "    concurrency: 5,",
      after:  "    concurrency: 20,",
    },
    isCorrect: false,
    explanation:
      "Incorrect. Concurrency doesn't fix timeout. More concurrent workers means more simultaneous timeouts, which amplifies the error rate. This is a latency issue, not a throughput issue.",
    scoreImpact: 10,
  },
];

// ── Incident Metrics (for Incident Response stage) ─────────────────────

export interface MetricSeries {
  label: string;
  unit: string;
  data: { time: string; value: number }[];
  threshold?: number;
  anomalyAt?: string; // time where anomaly peaked
}

export const INCIDENT_METRICS: Record<string, MetricSeries> = {
  errorRate: {
    label: "Error Rate (%)",
    unit: "%",
    threshold: 2,
    anomalyAt: "09:14",
    data: [
      { time: "08:50", value: 0.2 },
      { time: "09:00", value: 0.3 },
      { time: "09:10", value: 0.4 },
      { time: "09:14", value: 6.1 },
      { time: "09:20", value: 12.4 },
      { time: "09:30", value: 12.7 },
      { time: "09:40", value: 12.2 },
    ],
  },
  p99Latency: {
    label: "P99 Latency (ms)",
    unit: "ms",
    threshold: 800,
    anomalyAt: "09:14",
    data: [
      { time: "08:50", value: 320 },
      { time: "09:00", value: 340 },
      { time: "09:10", value: 380 },
      { time: "09:14", value: 1240 },
      { time: "09:20", value: 2340 },
      { time: "09:30", value: 2180 },
      { time: "09:40", value: 2260 },
    ],
  },
  requestVolume: {
    label: "Requests / min",
    unit: "req/min",
    anomalyAt: undefined,
    data: [
      { time: "08:50", value: 420 },
      { time: "09:00", value: 445 },
      { time: "09:10", value: 431 },
      { time: "09:14", value: 438 },
      { time: "09:20", value: 412 },
      { time: "09:30", value: 395 },
      { time: "09:40", value: 401 },
    ],
  },
};

export const INCIDENT_LOGS = [
  { time: "09:14:02", level: "ERROR", service: "payment-gateway", message: "WebhookHandler timeout after 5000ms — stripe event: payment_intent.created" },
  { time: "09:14:03", level: "ERROR", service: "payment-gateway", message: "WebhookHandler timeout after 5000ms — stripe event: payment_intent.created" },
  { time: "09:14:08", level: "WARN",  service: "payment-gateway", message: "RetryQueue: attempt 2/3 for webhookId=wh_abc123" },
  { time: "09:14:14", level: "ERROR", service: "payment-gateway", message: "RetryQueue: max retries exceeded for webhookId=wh_abc123, giving up" },
  { time: "09:14:14", level: "ERROR", service: "api-gateway",     message: "504 Gateway Timeout — /webhook/stripe — upstream: payment-gateway:3001" },
  { time: "09:15:01", level: "INFO",  service: "payment-gateway", message: "Queue concurrency at 4/5 — high pressure detected" },
  { time: "09:20:18", level: "ERROR", service: "payment-gateway", message: "WebhookHandler timeout after 5000ms — stripe event: checkout.session.completed" },
  { time: "09:21:00", level: "WARN",  service: "stripe-sdk",      message: "Stripe event delivery retry 1/3 — server did not respond within timeout" },
];

export const ROOT_CAUSE_OPTIONS = [
  { id: "rc-a", label: "Queue timeout (5s) too short for Stripe events that take 8-12s", isCorrect: true },
  { id: "rc-b", label: "API rate limiting from Stripe's servers causing delays", isCorrect: false },
  { id: "rc-c", label: "Database connection pool exhaustion under load", isCorrect: false },
  { id: "rc-d", label: "Memory leak in WebhookHandler accumulating since deployment", isCorrect: false },
];
