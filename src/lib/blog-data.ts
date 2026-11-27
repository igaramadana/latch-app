export type CategoryId =
  | "featured"
  | "announcement"
  | "guide"
  | "resources"
  | "tutorials"
  | "changelog"
  | "demo";

export interface Category {
  id: CategoryId;
  label: string;
  /** Chip ink and its 10% wash, sampled from the design. */
  fg: string;
  bg: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  callout?: {
    label: string;
    text: string;
  };
}

export interface Post {
  slug: string;
  category: CategoryId;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  iso: string;
  date: string;
  readTime: string;
  image: string;
  avatar: string;
  alt: string;
  keyTakeaways: string[];
  sections: ArticleSection[];
}

export const categories: Category[] = [
  { id: "featured", label: "Featured", fg: "#6EA1FE", bg: "rgb(110 161 254 / 0.10)" },
  { id: "announcement", label: "Announcement", fg: "#19966D", bg: "rgb(25 150 109 / 0.10)" },
  { id: "guide", label: "Guide", fg: "#D44C1D", bg: "rgb(212 76 29 / 0.10)" },
  { id: "resources", label: "Resources", fg: "#5E76FF", bg: "rgb(94 118 255 / 0.10)" },
  { id: "tutorials", label: "Tutorials", fg: "#C59810", bg: "rgb(197 152 16 / 0.10)" },
  { id: "changelog", label: "Changelog", fg: "#7C5CFF", bg: "rgb(124 92 255 / 0.10)" },
  { id: "demo", label: "Demo", fg: "#0F8BA8", bg: "rgb(15 139 168 / 0.10)" },
];

export const filters = [
  { id: "all", label: "All" },
  ...categories.map(({ id, label }) => ({ id, label })),
];

export const categoryById = new Map(categories.map((category) => [category.id, category]));

export const posts: Post[] = [
  {
    slug: "point-in-time-security",
    category: "featured",
    title: "Why point-in-time security can't keep up with cloud-native systems",
    excerpt:
      "Systems change by the minute, but most security still runs on a schedule. Here's how continuous, identity-aware protection closes the gap.",
    author: "Alex Norman",
    authorRole: "Head of Security Architecture",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "6 min read",
    image: "/images/resources/blog/blog_1",
    avatar: "/images/resources/blog/avatar_1.webp",
    alt: "Server corridor lit in blue with network nodes overlaid",
    keyTakeaways: [
      "Quarterly penetration tests and scheduled scans leave multi-week exposure windows in CI/CD environments.",
      "Combining continuous API testing with real-time identity context eliminates blind spots between releases.",
      "Security teams using continuous validation cut mean-time-to-remediation from weeks to under 24 hours.",
    ],
    sections: [
      {
        heading: "The cadence mismatch in modern SaaS",
        paragraphs: [
          "Engineering teams deploy dozens of times a week across microservices, managed APIs, and ephemeral cloud workloads. Yet most security programs still anchor themselves to quarterly pen-tests and weekly static scans.",
          "Every pull request can introduce a subtly misconfigured IAM policy, an undocumented shadow endpoint, or a broken authorization check. By the time a scheduled scan runs, that change has already been live in production for days.",
        ],
      },
      {
        heading: "Why identity context changes everything",
        paragraphs: [
          "Traditional scanners inspect surface configuration in isolation. They flag hundreds of theoretical issues without knowing which identities, tokens, or services can actually reach sensitive data.",
          "Identity-aware security correlates runtime permissions with live traffic and code changes, prioritizing the small percentage of findings that represent real exploitable paths.",
        ],
        bullets: [
          "Evaluate every human and machine identity continuously rather than relying on static role snapshots.",
          "Validate vulnerabilities against live execution context before paging engineers.",
          "Trigger automated containment runbooks the moment anomalous access patterns appear.",
        ],
        callout: {
          label: "Security Insight",
          text: "Teams moving from scheduled scans to continuous identity-aware testing see a 99.9% pre-release catch rate on critical authorization regressions.",
        },
      },
      {
        heading: "Closing the loop with continuous testing",
        paragraphs: [
          "The goal is not to slow down shipping—it is to make security run at the exact same tempo as your system. When validation happens automatically on every change and access decision, compliance evidence and risk visibility become natural byproducts of daily engineering work.",
        ],
      },
    ],
  },
  {
    slug: "continuous-testing-cicd",
    category: "guide",
    title: "A practical guide to continuous testing in your CI/CD pipeline",
    excerpt:
      "Step-by-step: how to catch real vulnerabilities before production without slowing your team's release cadence.",
    author: "Kevin Almeda",
    authorRole: "Staff DevSecOps Engineer",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "8 min read",
    image: "/images/resources/blog/blog_2",
    avatar: "/images/resources/blog/avatar_2.webp",
    alt: "Dark dashboard showing a green pipeline flowing from build to deploy",
    keyTakeaways: [
      "Run fast, high-signal checks on pull requests and deeper behavioral validation in staging.",
      "Avoid alert fatigue by gating builds only on verified, exploitable findings.",
      "Keep setup agentless with API and OAuth integrations so onboarding takes minutes.",
    ],
    sections: [
      {
        heading: "Designing a low-friction security gate",
        paragraphs: [
          "Security gates fail when they block merges with noisy false positives. Engineers quickly learn to bypass checks that take twenty minutes or flag unreachable code paths.",
          "A practical continuous testing pipeline separates rapid pre-merge checks from asynchronous staging validation, delivering actionable proof directly inside pull request comments.",
        ],
        bullets: [
          "Pre-merge (< 2 minutes): schema drift, auth boundary checks, and secret exposure validation.",
          "Staging environment: automated API fuzzing, privilege escalation checks, and business-logic tests.",
          "Production runtime: continuous behavioral monitoring and automated anomaly containment.",
        ],
      },
      {
        heading: "Connecting Latch without agents",
        paragraphs: [
          "Instead of installing heavy sidecars across every container, connect your Git provider, cloud accounts, and identity provider via scoped OAuth tokens. Latch maps your endpoints automatically and begins validating every deployment.",
        ],
        callout: {
          label: "Best Practice",
          text: "Start in observe-only mode for the first week to establish a clean baseline, then enforce blocking policies strictly on high-severity verified findings.",
        },
      },
    ],
  },
  {
    slug: "identity-aware-access",
    category: "announcement",
    title: "Introducing identity-aware access, now live for every workspace",
    excerpt:
      "Latch now evaluates every user and service in real time, so access decisions follow context instead of standing permissions.",
    author: "Axel David",
    authorRole: "VP of Product",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "4 min read",
    image: "/images/resources/blog/blog_3",
    avatar: "/images/resources/blog/avatar_3.webp",
    alt: "Network of violet identity nodes linked across a dark grid",
    keyTakeaways: [
      "Real-time contextual evaluation for both human users and machine/service accounts.",
      "Automatic detection of standing privilege creep and anomalous session behavior.",
      "Available immediately across Starter, Professional, and Enterprise workspaces.",
    ],
    sections: [
      {
        heading: "Moving beyond standing privileges",
        paragraphs: [
          "Static role-based access control was designed for an era when permissions rarely changed. Today, contractors, CI runners, AI agents, and microservices accumulate overlapping permissions that are rarely revoked.",
          "With Identity-Aware Access now live in Latch, every session and API token is evaluated continuously against device posture, geolocation, behavioral history, and resource sensitivity.",
        ],
      },
      {
        heading: "What ships today",
        paragraphs: [
          "Every Latch workspace now includes live identity graphs, automated least-privilege recommendations, and instant session revocation when high-risk signals trigger.",
        ],
        bullets: [
          "Unified graph linking SSO users, cloud IAM roles, and service API tokens.",
          "Instant session revocation and step-up verification hooks.",
          "Audit-ready access logs exported cleanly for SOC 2 and ISO 27001 reviews.",
        ],
      },
    ],
  },
  {
    slug: "security-blind-spots",
    category: "featured",
    title: "The real cost of security blind spots across a fragmented stack",
    excerpt:
      "When each tool sees only a slice, risk hides in the gaps. We break down what unified visibility actually changes.",
    author: "Sofia Alvarez",
    authorRole: "Director of Security Research",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "7 min read",
    image: "/images/resources/blog/blog_4",
    avatar: "/images/resources/blog/avatar_4.webp",
    alt: "Magenta security diagram with a padlock and shield around a stack of services",
    keyTakeaways: [
      "Disconnected point tools create duplicate alerts while missing cross-layer attack paths.",
      "Unifying app testing, identity, and runtime telemetry cuts security tool spend by up to 40%.",
      "One shared graph aligns engineering, security, and compliance teams around the same source of truth.",
    ],
    sections: [
      {
        heading: "How risk hides between point solutions",
        paragraphs: [
          "Most growing SaaS organizations accumulate separate tools for SAST, API scanning, cloud posture, and identity governance. Each dashboard produces its own severity score, yet none of them can answer a simple question: can an external request reach production customer data right now?",
          "Attackers exploit the seams between layers—chaining a low-severity API flaw with an overly permissive service token. Unified visibility exposes that chain before it becomes an incident.",
        ],
      },
      {
        heading: "Measuring the operational impact",
        paragraphs: [
          "Consolidating fragmented point tools into one continuous security layer removes hours of manual triage every week and accelerates enterprise security reviews by 3x.",
        ],
        callout: {
          label: "Key Metric",
          text: "Organizations consolidating three or more disconnected scanners onto Latch report 40% lower security tooling spend alongside faster release approvals.",
        },
      },
    ],
  },
  {
    slug: "connect-latch-api-oauth",
    category: "tutorials",
    title: "Connect Latch to your stack with API and OAuth in 10 minutes",
    excerpt:
      "Walk through a full setup: link your cloud, identity provider, and repos with no agents, then verify coverage end to end.",
    author: "Arjun Kapoor",
    authorRole: "Solutions Architect",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "5 min read",
    image: "/images/resources/blog/blog_5",
    avatar: "/images/resources/blog/avatar_5.webp",
    alt: "Screen showing connected services wired into a central control node",
    keyTakeaways: [
      "Zero agents or infrastructure restarts required—setup uses read-scoped OAuth and API integrations.",
      "Connect GitHub, AWS/GCP, and your IdP (Okta / Google Workspace) in under 10 minutes.",
      "Receive your first live coverage map and verified findings within minutes of connecting.",
    ],
    sections: [
      {
        heading: "Step 1 — Link your identity provider",
        paragraphs: [
          "Open Settings -> Integrations inside your Latch workspace and authorize your identity provider (Okta, Google Workspace, or Entra ID) via OAuth. Latch immediately indexes active users, groups, and SSO applications.",
        ],
      },
      {
        heading: "Step 2 — Connect repositories & cloud APIs",
        paragraphs: [
          "Install the Latch GitHub App on your target repositories and attach read-only cloud roles for AWS, GCP, or Kubernetes. Latch automatically correlates deployed endpoints with repository owners.",
        ],
        bullets: [
          "Verify green health status across all connected integrations.",
          "Trigger an initial baseline discovery scan across staging APIs.",
          "Configure Slack or PagerDuty routing for high-severity verified alerts.",
        ],
      },
    ],
  },
  {
    slug: "automated-response",
    category: "announcement",
    title: "Automated response is here: contain threats the moment they appear",
    excerpt:
      "New runbooks let Latch remediate confirmed risks automatically, shrinking the window between detection and fix.",
    author: "Marcus Reed",
    authorRole: "Principal Systems Engineer",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "5 min read",
    image: "/images/resources/blog/blog_6",
    avatar: "/images/resources/blog/avatar_6.webp",
    alt: "Glowing shield over a map of risk signals",
    keyTakeaways: [
      "Pre-built, auditable runbooks contain confirmed threats in under 60 seconds.",
      "Supports automatic session revocation, IP/token throttling, and pull request remediation.",
      "Full human-in-the-loop approval mode available for sensitive production workflows.",
    ],
    sections: [
      {
        heading: "Why speed decides incident outcomes",
        paragraphs: [
          "Detection alone is never enough when an automated credential-stuffing or token-abuse attack unfolds in seconds. Waiting for an on-call engineer to wake up, inspect logs, and revoke tokens manually leaves too much time on the table.",
          "Latch Automated Response pairs high-confidence behavioral detection with deterministic runbooks that isolate compromised sessions immediately while notifying your team with full context.",
        ],
      },
      {
        heading: "Built-in guardrails for production safety",
        paragraphs: [
          "Every runbook supports dry-run simulation, scoped blast-radius limits, and one-click rollback so security teams can automate confidently without risking service availability.",
        ],
        callout: {
          label: "Measured Speed",
          text: "Confirmed anomalous sessions are automatically isolated in an average of 42 seconds from initial behavioral detection.",
        },
      },
    ],
  },
  {
    slug: "identity-first-access-rules",
    category: "featured",
    title: "Setting up identity-first access rules for teams and services",
    excerpt:
      "Learn how to model context-aware policies so access is granted on real signals, not permanent, over-broad permissions.",
    author: "Arjun Kapoor",
    authorRole: "Solutions Architect",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "6 min read",
    image: "/images/resources/blog/blog_7",
    avatar: "/images/resources/blog/avatar_7.webp",
    alt: "Blueprint of identity cards arranged in a control panel",
    keyTakeaways: [
      "Model policies around workload identity and session context rather than static IP allowlists.",
      "Separate human interactive rules from non-human machine/CI service policies.",
      "Continuously prune unused permissions with automated weekly access reviews.",
    ],
    sections: [
      {
        heading: "Structuring policies that scale with your org",
        paragraphs: [
          "Start by grouping resources into three sensitivity tiers—public, internal, and restricted production data—and attach context requirements directly to each tier.",
          "For restricted environments, require fresh SSO authentication, verified device posture, and short-lived just-in-time elevation rather than permanent admin roles.",
        ],
        bullets: [
          "Enforce short-lived credentials (< 1 hour) for production database and cluster access.",
          "Scope machine tokens strictly to individual services and rotate automatically.",
          "Alert on privilege escalation outside normal working hours or unfamiliar geographies.",
        ],
      },
    ],
  },
  {
    slug: "continuous-security-loop",
    category: "guide",
    title: "Building a continuous security loop: connect, monitor, detect, respond",
    excerpt:
      "A framework for keeping protection in step with a system that never stops changing, mapped to real workflows.",
    author: "Marcus Reed",
    authorRole: "Principal Systems Engineer",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "7 min read",
    image: "/images/resources/blog/blog_8",
    avatar: "/images/resources/blog/avatar_8.webp",
    alt: "Circular diagram labelled connect, monitor, detect and respond",
    keyTakeaways: [
      "Effective SaaS security operates as a closed 4-stage loop: Connect, Monitor, Detect, Respond.",
      "Each stage feeds verified context back into the next, compounding accuracy over time.",
      "Aligns engineering velocity with continuous compliance readiness.",
    ],
    sections: [
      {
        heading: "The four stages of continuous security",
        paragraphs: [
          "Point-in-time audits treat security as a linear checklist. In contrast, cloud-native systems require a continuous loop where every deployment, identity change, and runtime event informs your security posture immediately.",
        ],
        bullets: [
          "Connect: Integrate cloud, repos, APIs, and identity providers via OAuth with zero agents.",
          "Monitor: Continuously test endpoints and evaluate access across every release.",
          "Detect: Surface real exploitable anomalies using behavioral AI models with low noise.",
          "Respond: Contain confirmed risks automatically and generate audit-ready evidence.",
        ],
      },
    ],
  },
  {
    slug: "compliance-reporting",
    category: "announcement",
    title: "Compliance reporting: audit-ready evidence, generated for you",
    excerpt:
      "Turn continuous monitoring into structured reports for security reviews and enterprise approvals, no manual collection.",
    author: "Devi Lestari",
    authorRole: "Compliance & Trust Lead",
    iso: "2026-03-12",
    date: "March 12, 2026",
    readTime: "4 min read",
    image: "/images/resources/blog/blog_9",
    avatar: "/images/resources/blog/avatar_9.webp",
    alt: "Compliance score of 92 percent next to an evidence report",
    keyTakeaways: [
      "Automated evidence collection mapped directly to SOC 2 Type II and ISO 27001 controls.",
      "One-click exportable security proof for enterprise customer questionnaires.",
      "Eliminates last-minute screenshot gathering before annual audits.",
    ],
    sections: [
      {
        heading: "Turning live security signals into audit proof",
        paragraphs: [
          "Compliance teams spend weeks every year chasing engineers for screenshots of access reviews, vulnerability scans, and incident logs. Latch eliminates that manual chase by mapping your live continuous testing and identity controls directly to compliance frameworks.",
          "Whenever an enterprise prospect sends a security questionnaire, sales and security teams can export verifiable, up-to-date proof in seconds—accelerating deal approvals by up to 3x.",
        ],
        callout: {
          label: "Audit Ready",
          text: "Every exported compliance bundle includes timestamped control verification, remediation history, and cryptographic integrity metadata.",
        },
      },
    ],
  },
];

export function getRelatedPosts(currentSlug: string, category: CategoryId, limit = 3): Post[] {
  const others = posts.filter((post) => post.slug !== currentSlug);
  const sameCategory = others.filter((post) => post.category === category);
  const rest = others.filter((post) => post.category !== category);
  return [...sameCategory, ...rest].slice(0, limit);
}
