import { useState, useEffect, useCallback, useRef } from "react";

// ─── BACKEND CONFIG ──────────────────────────────────────────────────────────────
// Change this to your deployed backend URL when you go live
const API_BASE = "http://localhost:3001";

// ─── DESIGN SYSTEM ──────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

  :root {
    --bg:        #070C16;
    --surface:   #0C1423;
    --card:      #101928;
    --card-hover:#131f31;
    --border:    #1C2B44;
    --border-hi: #243553;
    --accent:    #4F52E0;
    --accent-hi: #6366F1;
    --accent-glow: rgba(99,102,241,0.18);
    --cyan:      #22D3EE;
    --cyan-dim:  rgba(34,211,238,0.12);
    --amber:     #F59E0B;
    --amber-dim: rgba(245,158,11,0.12);
    --green:     #10B981;
    --green-dim: rgba(16,185,129,0.12);
    --red:       #F87171;
    --red-dim:   rgba(248,113,113,0.1);
    --t1: #F1F5F9;
    --t2: #94A3B8;
    --t3: #475569;
    --t4: #2D3F5A;
    --font:  'Space Grotesk', -apple-system, sans-serif;
    --mono:  'IBM Plex Mono', 'Fira Code', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--t1);
    font-family: var(--font);
    -webkit-font-smoothing: antialiased;
  }

  .archon { min-height: 100vh; background: var(--bg); }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 3px; }

  /* ── Grid dot background ── */
  .dot-bg {
    background-image: radial-gradient(var(--border) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* ── Glow ── */
  .accent-glow { box-shadow: 0 0 32px var(--accent-glow); }

  /* ── Pulse animation ── */
  @keyframes pulse-ring {
    0%   { transform: scale(0.9); opacity: 0.8; }
    70%  { transform: scale(1.4); opacity: 0;   }
    100% { transform: scale(1.4); opacity: 0;   }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.1s ease both; }
  .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.4s 0.2s ease both; }

  /* ── Card ── */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 24px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: var(--border-hi); }

  /* ── Btn ── */
  .btn-primary {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 11px 24px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover  { background: var(--accent-hi); }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled {
    background: var(--border);
    color: var(--t3);
    cursor: not-allowed;
    transform: none;
  }
  .btn-ghost {
    background: transparent;
    color: var(--t2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 20px;
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .btn-ghost:hover { background: var(--surface); color: var(--t1); }

  /* ── Select / Toggle chips ── */
  .sel-chip {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--t2);
    border-radius: 8px;
    padding: 9px 14px;
    font-family: var(--font);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }
  .sel-chip:hover { border-color: var(--border-hi); color: var(--t1); }
  .sel-chip.active {
    border-color: var(--accent-hi);
    background: var(--accent-glow);
    color: #a5b4fc;
  }
  .tog-chip {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--t3);
    border-radius: 6px;
    padding: 6px 12px;
    font-family: var(--font);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tog-chip:hover { color: var(--t2); border-color: var(--border-hi); }
  .tog-chip.active {
    border-color: var(--accent-hi);
    background: var(--accent-glow);
    color: #a5b4fc;
  }

  /* ── Textarea / Input ── */
  .field {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--t1);
    border-radius: 10px;
    padding: 12px 16px;
    font-family: var(--font);
    font-size: 13px;
    width: 100%;
    transition: border-color 0.2s;
    outline: none;
  }
  .field:focus { border-color: var(--accent-hi); }
  .field::placeholder { color: var(--t4); }
  textarea.field { resize: none; line-height: 1.6; }

  /* ── Badge ── */
  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 500;
    font-family: var(--mono);
  }
  .badge-default { background: var(--border); color: var(--t2); }
  .badge-accent  { background: var(--accent-glow); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
  .badge-cyan    { background: var(--cyan-dim); color: var(--cyan); border: 1px solid rgba(34,211,238,0.25); }
  .badge-amber   { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(245,158,11,0.25); }
  .badge-green   { background: var(--green-dim); color: var(--green); border: 1px solid rgba(16,185,129,0.25); }
  .badge-red     { background: var(--red-dim); color: var(--red); border: 1px solid rgba(248,113,113,0.2); }

  /* ── Label ── */
  .label {
    font-size: 11px;
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--t3);
    margin-bottom: 8px;
    display: block;
  }

  /* ── Section heading ── */
  .sec-head {
    display: flex; align-items: flex-start; gap: 10px;
    margin-bottom: 18px;
  }
  .sec-icon {
    font-size: 16px;
    margin-top: 1px;
    flex-shrink: 0;
  }
  .sec-title  { font-size: 14px; font-weight: 600; color: var(--t1); }
  .sec-sub    { font-size: 12px; color: var(--t3); margin-top: 2px; }

  /* ── Divider ── */
  .divider { border: none; border-top: 1px solid var(--border); }

  /* ── Progress bar ── */
  .prog-track { height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .prog-fill  { height: 100%; background: linear-gradient(90deg, var(--accent), var(--cyan)); transition: width 0.4s ease; }

  /* ── Sticky topbar ── */
  .topbar {
    position: sticky; top: 0; z-index: 100;
    background: rgba(7,12,22,0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    height: 52px;
    display: flex; align-items: center;
    padding: 0 24px;
  }

  /* ── Pattern pill ── */
  .pattern-pill {
    display: inline-flex; align-items: center;
    padding: 6px 18px;
    border-radius: 30px;
    font-family: var(--font);
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.01em;
  }

  /* ── Stat box ── */
  .stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .stat-val { font-family: var(--mono); font-size: 22px; font-weight: 500; line-height: 1; }
  .stat-lbl { font-size: 11px; color: var(--t3); margin-top: 4px; }

  /* ── Cost bar row ── */
  .cost-row { margin-bottom: 14px; }
  .cost-row:last-child { margin-bottom: 0; }
  .cost-label { display: flex; justify-content: space-between; margin-bottom: 5px; }
  .cost-track { height: 4px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .cost-fill  { height: 100%; background: linear-gradient(90deg, var(--accent), var(--cyan)); border-radius: 4px; transition: width 0.8s ease; }

  /* ── Component item ── */
  .comp-item {
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 8px;
    transition: border-color 0.15s;
  }
  .comp-item:last-child { margin-bottom: 0; }
  .comp-item:hover { border-color: var(--border-hi); }

  /* ── Risk card ── */
  .risk-card {
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 8px;
    border-left-width: 3px;
    border-left-style: solid;
  }
  .risk-card:last-child { margin-bottom: 0; }
  .risk-high  { background: var(--red-dim); border-color: var(--red); }
  .risk-med   { background: var(--amber-dim); border-color: var(--amber); }
  .risk-low   { background: var(--green-dim); border-color: var(--green); }

  /* ── Step dot ── */
  .step-dot {
    width: 22px; height: 22px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-family: var(--mono);
    font-size: 10px;
    transition: all 0.3s;
  }
  .step-dot.done    { background: var(--green-dim); color: var(--green); }
  .step-dot.current { background: var(--accent-glow); color: #a5b4fc; }
  .step-dot.pending { background: var(--border); color: var(--t4); }

  /* ── Analysis step row ── */
  .ana-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; transition: opacity 0.4s; }
  .ana-row.done    { opacity: 0.5; }
  .ana-row.current { opacity: 1; }
  .ana-row.pending { opacity: 0.2; }
  .ana-text { font-size: 13px; color: var(--t1); }
  .ana-text.done { text-decoration: line-through; color: var(--t3); }

  /* ── Topbar logo ── */
  .logo-mark {
    width: 28px; height: 28px;
    background: var(--accent);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  /* ── Float action ── */
  .copy-btn {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--t2);
    border-radius: 8px;
    padding: 6px 14px;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .copy-btn:hover { background: var(--card); color: var(--t1); border-color: var(--border-hi); }

  .new-btn {
    background: var(--accent-glow);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
    border-radius: 8px;
    padding: 6px 14px;
    font-family: var(--font);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .new-btn:hover { background: var(--accent); color: #fff; }

  /* ── Landing hero ── */
  .hero-orb {
    position: relative;
    width: 80px; height: 80px;
    display: flex; align-items: center; justify-content: center;
  }
  .hero-orb-ring {
    position: absolute;
    inset: 0; border-radius: 50%;
    background: transparent;
    border: 1.5px solid var(--accent);
    opacity: 0;
    animation: pulse-ring 2.4s ease-out infinite;
  }
  .hero-orb-ring:nth-child(2) { animation-delay: 0.8s; }
  .hero-orb-ring:nth-child(3) { animation-delay: 1.6s; }
  .hero-orb-core {
    width: 52px; height: 52px;
    background: var(--accent);
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    position: relative; z-index: 1;
    box-shadow: 0 0 30px var(--accent-glow);
  }

  /* ── Grid layout for results ── */
  @media (min-width: 768px) {
    .results-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .results-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  }
  @media (max-width: 767px) {
    .results-grid-2, .results-grid-3 { display: flex; flex-direction: column; gap: 16px; }
  }
`;

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const INDUSTRIES = [
  "Insurance & Annuities", "Financial Services & Banking",
  "Healthcare & Life Sciences", "Legal & Compliance",
  "Retail & E-commerce", "Manufacturing & Supply Chain",
  "Technology & SaaS", "Real Estate", "Education & EdTech",
  "Government & Public Sector", "Other",
];

const DATA_OPTS = [
  "Documents & PDFs", "Structured Database", "Real-time APIs",
  "Unstructured Text", "Code & Technical Docs", "Images & Media", "Mixed",
];

const COMPLIANCE_OPTS = [
  "GDPR", "HIPAA", "SOC 2", "PCI-DSS", "FINRA / SEC", "NAIC (Insurance)", "None",
];

const ANA_STEPS = [
  "Parsing business problem...",
  "Classifying problem type & complexity...",
  "Evaluating pattern fit: RAG vs Agentic RAG vs Multi-Agent...",
  "Mapping data flow & latency constraints...",
  "Selecting optimal models for your requirements...",
  "Modeling cost structure at target volumes...",
  "Identifying architectural risks...",
  "Composing consulting brief...",
];

const DEMO = {
  problem: "Our insurance claims adjusters spend hours manually reviewing PDF policy documents to extract coverage limits, exclusions, and endorsements, then cross-referencing them against claim submissions to determine eligibility and coverage amounts. We need to automate initial claim triage — classifying claim type, extracting relevant policy terms, and routing to the correct specialist team based on complexity, coverage type, and estimated payout.",
  industry: "Insurance & Annuities",
  dataTypes: ["Documents & PDFs", "Structured Database"],
  latency: "near-real-time",
  volume: "medium",
  accuracyStakes: "high",
  budget: "scale",
  compliance: ["NAIC (Insurance)", "SOC 2"],
  existingStack: "AWS, PostgreSQL, Python",
  currentProcess: "Claims adjusters manually review PDF policy documents, extract coverage details, cross-reference claim submissions, and route to specialist teams. Each claim requires 3-4 hours of manual work.",
  currentMonthlyCost: "45000",
  currentTimePerTask: "4",
  currentTimeUnit: "hours",
  currentAccuracy: "87",
  currentTeamSize: "12",
  techConstraints: "Must integrate with existing Salesforce and AWS infrastructure, no rip-and-replace",
  teamConstraints: "Team of 3 ML engineers, no LangChain experience",
  timeline: "MVP in 8 weeks, full production in 16 weeks",
  implBudget: "120000",
  specificRegs: "NAIC Model Bulletin compliance required for all AI underwriting decisions",
};

const SYSTEM_PROMPT = `You are Chanakya, a senior AI solution architect and product consultant. You analyze business problems and design optimal AI architectures with precise cost modeling.

Return ONLY a valid JSON object with no markdown, no backticks, no extra text.

JSON structure to return:
{
  "executive_summary": "2-3 actionable sentences for a CTO or VP Engineering",
  "recommended_pattern": {
    "name": "exactly one of: Simple LLM | RAG | Agentic RAG | Multi-Agent | MCP Integration | RAG + Multi-Agent | Custom Pipeline",
    "confidence": "High or Medium or Low",
    "one_liner": "one memorable sentence capturing the core insight",
    "rationale": "3-4 sentences explaining why this pattern fits this specific problem, data, and constraints",
    "complexity": "Low or Medium or High",
    "time_to_first_value": "realistic estimate e.g. 2-3 weeks"
  },
  "architecture": {
    "components": [
      {
        "name": "component name",
        "role": "what it does in this solution",
        "recommended_tool": "specific tool or framework (e.g. LangGraph, pgvector, Weaviate)",
        "alternatives": ["alt1", "alt2"],
        "why": "reason specific to this problem"
      }
    ],
    "data_flow": ["step 1", "step 2", "step 3", "step 4", "step 5"],
    "key_decision": "the single most important architectural choice to get right"
  },
  "models": [
    {
      "role": "Primary or Fallback or Embedding or Reranker",
      "name": "exact current model name",
      "provider": "provider name",
      "why": "specific reason for this problem's requirements",
      "input_cost_per_1m": 0.00,
      "output_cost_per_1m": 0.00,
      "best_for": "specific role in this solution"
    }
  ],
  "cost_model": {
    "assumptions": "key assumptions driving these estimates",
    "cost_drivers": ["driver 1", "driver 2", "driver 3"],
    "per_request": {
      "p50_usd": 0.001,
      "p90_usd": 0.008,
      "breakdown": "token and operation breakdown e.g. ~600 input + 250 output + 2 retrieval ops"
    },
    "monthly_estimates": {
      "low_1k_req": 5.00,
      "medium_10k_req": 48.00,
      "high_100k_req": 440.00
    },
    "optimization_tips": ["tip 1", "tip 2", "tip 3"]
  },
  "alternatives": [
    {
      "pattern": "alternative pattern name",
      "tradeoff": "what you give up vs recommended",
      "cost_delta": "e.g. 55% cheaper or 2x more expensive",
      "choose_if": "specific condition when this is the better choice"
    }
  ],
  "risks": [
    {
      "risk": "specific risk for this problem domain",
      "severity": "High or Medium or Low",
      "mitigation": "concrete, actionable mitigation"
    }
  ],
  "next_steps": [
    {
      "step": "specific action",
      "priority": "High or Medium or Low",
      "effort": "time estimate",
      "outcome": "deliverable when done"
    }
  ],
  "compliance_notes": "compliance-specific architecture recommendations relevant to stated requirements, or empty string",
  "differentiator": "what makes this architectural approach uniquely suited and the core moat",
  "mermaid_diagram": "a valid flowchart LR mermaid diagram showing the full orchestration flow. Use correct mermaid syntax. Include all agents, tools, databases [(DB Name)], external services([Service Name]), decisions{Decision?}, and processing steps[Step Name] as nodes connected by labeled arrows -->|label|. Show complete data flow from user input to final output. Be specific to this architecture. No subgraphs. Keep node names short under 25 chars."
}`;

// ─── UTILS ────────────────────────────────────────────────────────────────────

const fmtCost = (v) => {
  if (v == null) return "—";
  if (v < 0.001) return `$${(v * 1000).toFixed(2)}m`;
  if (v < 0.01)  return `${(v * 100).toFixed(3)}¢`;
  if (v < 1)     return `$${v.toFixed(4)}`;
  return `$${v.toFixed(2)}`;
};

const fmtMonthly = (v) => {
  if (v == null) return "—";
  if (v < 1)   return `$${v.toFixed(2)}`;
  if (v < 100) return `$${v.toFixed(1)}`;
  if (v < 1000) return `$${Math.round(v)}`;
  return `$${(v / 1000).toFixed(1)}k`;
};

const patternGradient = (p) => ({
  "Simple LLM":        "linear-gradient(135deg,#475569,#334155)",
  "RAG":               "linear-gradient(135deg,#1d4ed8,#1e40af)",
  "Agentic RAG":       "linear-gradient(135deg,#4338ca,#6d28d9)",
  "Multi-Agent":       "linear-gradient(135deg,#7c3aed,#be185d)",
  "MCP Integration":   "linear-gradient(135deg,#0e7490,#1d4ed8)",
  "RAG + Multi-Agent": "linear-gradient(135deg,#5b21b6,#3730a3)",
  "Custom Pipeline":   "linear-gradient(135deg,#065f46,#0f766e)",
}[p] || "linear-gradient(135deg,#4338ca,#6d28d9)");

const severityStyle = (s) =>
  s === "High"   ? "risk-high" :
  s === "Medium" ? "risk-med"  : "risk-low";

const severityBadge = (s) =>
  s === "High"   ? "badge-red" :
  s === "Medium" ? "badge-amber" : "badge-green";

const priorityBadge = (p) =>
  p === "High"   ? "badge-red" :
  p === "Medium" ? "badge-amber" : "badge-default";

// ─── LANDING ─────────────────────────────────────────────────────────────────

function Landing({ onStart, onDemo }) {

  return (
    <div className="archon dot-bg" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px 16px", position: "relative" }}>

      {/* Backend powers this — no client-side key needed */}

      {/* Hero */}
      <div className="fade-up" style={{ textAlign: "center", maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div className="hero-orb">
            <div className="hero-orb-ring" />
            <div className="hero-orb-ring" />
            <div className="hero-orb-ring" />
            <div className="hero-orb-core">⬡</div>
          </div>
        </div>

        <span className="label" style={{ marginBottom: 12, display: "block" }}>AI Strategy & Architecture Advisor</span>

        <h1 style={{ fontSize: 52, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--t1)", lineHeight: 1.05, marginBottom: 12 }}>
          Chanakya
        </h1>

        <p style={{ fontSize: 16, color: "var(--t2)", lineHeight: 1.65, marginBottom: 8 }}>
          Describe your business problem.
        </p>
        <p style={{ fontSize: 16, color: "var(--t2)", lineHeight: 1.65, marginBottom: 40 }}>
          Get a <span style={{ color: "var(--t1)", fontWeight: 500 }}>consultant-grade AI architecture brief</span> in under a minute.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 52 }}>
          <button className="btn-primary" onClick={onStart} style={{ padding: "12px 32px", fontSize: 15 }}>
            Analyze a Problem →
          </button>
          <button className="btn-ghost" onClick={onDemo} style={{ fontSize: 14 }}>
            Try insurance example
          </button>
        </div>

        {/* Feature row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { icon: "🎯", title: "Pattern Selection", desc: "RAG · Agentic RAG · Multi-Agent · MCP" },
            { icon: "💰", title: "Cost Modeling",     desc: "Per-request & monthly projections" },
            { icon: "📋", title: "Consulting Brief",  desc: "Copyable deliverable for your team" },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── INTAKE ───────────────────────────────────────────────────────────────────

function Intake({ formData, setFormData, onSubmit, onBack }) {
  const [step, setStep] = useState(1);
  const TOTAL = 5;

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));
  const tog = (k, v) => setFormData(p => {
    const arr = p[k] || [];
    return { ...p, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
  });

  const canNext =
    step === 1 ? (formData.problem || "").length > 20 && !!formData.industry :
    step === 2 ? (formData.dataTypes || []).length > 0 && !!formData.latency && !!formData.volume :
    step === 3 ? !!formData.accuracyStakes && !!formData.budget :
    step === 4 ? true :
    true;

  const doNext = () => { if (step < TOTAL) setStep(s => s + 1); else onSubmit(); };

  const Chip = ({ field, val, label, multi }) => {
    const active = multi
      ? (formData[field] || []).includes(val)
      : formData[field] === val;
    return multi
      ? <button className={`tog-chip ${active ? "active" : ""}`} onClick={() => tog(field, val)}>{label}</button>
      : <button className={`sel-chip ${active ? "active" : ""}`} onClick={() => set(field, val)}>{label}</button>;
  };

  return (
    <div className="archon" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", minHeight: "100vh", padding: "40px 16px 60px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Progress header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <button onClick={step === 1 ? onBack : () => setStep(s => s - 1)} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 13, fontFamily: "var(--font)" }}>
            ← Back
          </button>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[1,2,3].map(n => (
              <div key={n} style={{
                height: 3, borderRadius: 2, transition: "all 0.3s",
                background: n <= step ? "var(--accent)" : "var(--border)",
                width: n <= step ? 32 : 16,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>{step}/{TOTAL}</span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>What's the problem?</h2>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>More context = sharper architecture. Describe the current pain, not the desired solution.</p>
            </div>
            <div>
              <span className="label">Business problem</span>
              <textarea
                className="field"
                rows={6}
                value={formData.problem || ""}
                onChange={e => set("problem", e.target.value)}
                placeholder="e.g. Our claims adjusters spend hours manually reviewing policy PDFs to determine coverage eligibility. We need to automate triage, extract relevant terms, and route claims to the right team..."
              />
              <div style={{ fontSize: 11, color: "var(--t4)", marginTop: 6, fontFamily: "var(--mono)" }}>
                {(formData.problem || "").length} chars — aim for 50+
              </div>
            </div>
            <div>
              <span className="label">Industry</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {INDUSTRIES.map(i => <Chip key={i} field="industry" val={i} label={i} />)}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Technical context</h2>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>Shapes the pattern and cost model significantly.</p>
            </div>
            <div>
              <span className="label">Data sources involved <span style={{ textTransform: "none", letterSpacing: 0 }}>(pick all that apply)</span></span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DATA_OPTS.map(v => <Chip key={v} field="dataTypes" val={v} label={v} multi />)}
              </div>
            </div>
            <div>
              <span className="label">Response latency requirement</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { v: "real-time",      l: "Real-time — under 2s (synchronous, user-facing)" },
                  { v: "near-real-time", l: "Near real-time — 2–10s (interactive, tolerant)" },
                  { v: "batch",          l: "Batch / async — minutes OK (background job)" },
                ].map(o => <Chip key={o.v} field="latency" val={o.v} label={o.l} />)}
              </div>
            </div>
            <div>
              <span className="label">Expected daily request volume</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { v: "low",        l: "Low — under 500/day (prototype or internal tool)" },
                  { v: "medium",     l: "Medium — 500–10K/day (team or department scale)" },
                  { v: "high",       l: "High — 10K–100K/day (product scale)" },
                  { v: "enterprise", l: "Enterprise — 100K+/day (platform scale)" },
                ].map(o => <Chip key={o.v} field="volume" val={o.v} label={o.l} />)}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>Constraints & stakes</h2>
              <p style={{ fontSize: 13, color: "var(--t2)" }}>Determines cost vs. quality tradeoffs in the recommendation.</p>
            </div>
            <div>
              <span className="label">Accuracy stakes</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { v: "low",      l: "Low — internal tool, errors mean a retry" },
                  { v: "medium",   l: "Medium — customer-facing, errors cause friction" },
                  { v: "high",     l: "High — regulated or financial, errors have consequences" },
                  { v: "critical", l: "Critical — safety or compliance-critical, near-zero tolerance" },
                ].map(o => <Chip key={o.v} field="accuracyStakes" val={o.v} label={o.l} />)}
              </div>
            </div>
            <div>
              <span className="label">Monthly AI budget</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  { v: "bootstrap",  l: "< $500 · Bootstrap" },
                  { v: "growth",     l: "$500–$5K · Growth" },
                  { v: "scale",      l: "$5K–$50K · Scale" },
                  { v: "enterprise", l: "$50K+ · Enterprise" },
                ].map(o => <Chip key={o.v} field="budget" val={o.v} label={o.l} />)}
              </div>
            </div>
            <div>
              <span className="label">Compliance requirements <span style={{ textTransform: "none", letterSpacing: 0 }}>(pick all that apply)</span></span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {COMPLIANCE_OPTS.map(v => <Chip key={v} field="compliance" val={v} label={v} multi />)}
              </div>
            </div>
            <div>
              <span className="label">Existing tech stack <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <input
                type="text"
                className="field"
                value={formData.existingStack || ""}
                onChange={e => set("existingStack", e.target.value)}
                placeholder="e.g. AWS, PostgreSQL, React, Python"
              />
            </div>
          </div>
        )}



        {step === 4 && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>What constraints do you face?</h2>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
                Optional — but makes the architecture recommendation <span style={{ color: "var(--cyan)", fontWeight: 500 }}>specific to your real situation</span>, not generic. Constraints will flag conflicts across the analysis.
              </p>
            </div>
            <div>
              <span className="label">Technical constraints <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <textarea className="field" rows={2}
                value={formData.techConstraints || ""}
                onChange={e => set("techConstraints", e.target.value)}
                placeholder="e.g. Must use AWS, existing PostgreSQL, no rip-and-replace of Salesforce, Python only..."
              />
            </div>
            <div>
              <span className="label">Team constraints <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <textarea className="field" rows={2}
                value={formData.teamConstraints || ""}
                onChange={e => set("teamConstraints", e.target.value)}
                placeholder="e.g. 2 ML engineers, no LangChain experience, part-time availability..."
              />
            </div>
            <div className="results-grid-2">
              <div>
                <span className="label">Timeline <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
                <input className="field" value={formData.timeline || ""} onChange={e => set("timeline", e.target.value)} placeholder="e.g. MVP in 6 weeks, prod in 12 weeks" />
              </div>
              <div>
                <span className="label">Implementation budget <span style={{ textTransform: "none", letterSpacing: 0 }}>(USD, optional)</span></span>
                <input type="number" className="field" value={formData.implBudget || ""} onChange={e => set("implBudget", e.target.value)} placeholder="e.g. 80000" />
              </div>
            </div>
            <div>
              <span className="label">Specific regulatory requirements <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <textarea className="field" rows={2}
                value={formData.specificRegs || ""}
                onChange={e => set("specificRegs", e.target.value)}
                placeholder="e.g. NAIC Model Bulletin for AI underwriting, data must stay on-prem..."
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>How does it work today?</h2>
              <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>
                Optional — adds a <span style={{ color: "var(--cyan)", fontWeight: 500 }}>Should You Build AI?</span> verdict and ROI analysis. Skip if you don't have the data.
              </p>
            </div>
            <div>
              <span className="label">Current process <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <textarea className="field" rows={3}
                value={formData.currentProcess || ""}
                onChange={e => set("currentProcess", e.target.value)}
                placeholder="e.g. Claims adjusters manually review PDFs, extract coverage limits, cross-reference submissions..."
              />
            </div>
            <div className="results-grid-2">
              <div>
                <span className="label">Monthly cost (USD) <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
                <input type="number" className="field" value={formData.currentMonthlyCost || ""} onChange={e => set("currentMonthlyCost", e.target.value)} placeholder="e.g. 45000" />
              </div>
              <div>
                <span className="label">Team size (headcount) <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
                <input type="number" className="field" value={formData.currentTeamSize || ""} onChange={e => set("currentTeamSize", e.target.value)} placeholder="e.g. 6" />
              </div>
            </div>
            <div>
              <span className="label">Time per task <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" className="field" style={{ flex: 1 }} value={formData.currentTimePerTask || ""} onChange={e => set("currentTimePerTask", e.target.value)} placeholder="e.g. 4" />
                <select className="field" style={{ width: 130 }} value={formData.currentTimeUnit || "hours"} onChange={e => set("currentTimeUnit", e.target.value)}>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
            </div>
            <div>
              <span className="label">Current accuracy % <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span></span>
              <input type="number" className="field" value={formData.currentAccuracy || ""} onChange={e => set("currentAccuracy", e.target.value)} placeholder="e.g. 87" min="0" max="100" />
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
          <button className="btn-primary" onClick={doNext} disabled={!canNext}>
            {step === TOTAL ? "Run Analysis →" : step === 3 ? "Add Constraints →" : step === 4 ? "Add Legacy Data →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ANALYZING ───────────────────────────────────────────────────────────────

function Analyzing({ progress }) {
  return (
    <div className="archon" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Orb */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid var(--accent)", opacity: 0,
              animation: "pulse-ring 1.8s ease-out infinite",
            }} />
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid var(--accent)", opacity: 0,
              animation: "pulse-ring 1.8s 0.6s ease-out infinite",
            }} />
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "var(--accent)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18,
              boxShadow: "0 0 24px var(--accent-glow)", position: "relative", zIndex: 1,
            }}>⬡</div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, textAlign: "center", marginBottom: 6 }}>
          Analyzing your problem
        </h2>
        <p style={{ fontSize: 13, color: "var(--t2)", textAlign: "center", marginBottom: 32 }}>
          Chanakya is designing your architecture brief...
        </p>

        <div>
          {ANA_STEPS.map((txt, i) => {
            const state = progress > i ? "done" : progress === i ? "current" : "pending";
            return (
              <div key={i} className={`ana-row ${state}`} style={{ transition: "opacity 0.5s" }}>
                <div className={`step-dot ${state}`}>
                  {state === "done" ? "✓" : state === "current" ? "●" : "○"}
                </div>
                <span className={`ana-text ${state}`}>{txt}</span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 28 }}>
          <div className="prog-track">
            <div className="prog-fill" style={{ width: `${(progress / ANA_STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── OPTIMIZE PANEL ───────────────────────────────────────────────────────────

function OptimizePanel({ analysis, formData, onAnalysisUpdated }) {
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const optimize = async (type) => {
    setLoading(type); setResult(null); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, analysis, optimizationType: type }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult({ type, ...json });
      if (json.optimized_analysis) onAnalysisUpdated(json.optimized_analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const opts = [
    { type: "cost",     icon: "💰", label: "Cut Costs 50%",   desc: "Cheaper models + caching" },
    { type: "latency",  icon: "⚡", label: "Halve Latency",   desc: "Streaming + parallel fetch" },
    { type: "accuracy", icon: "🎯", label: "Max Accuracy",    desc: "Reranking + hybrid search" },
  ];

  return (
    <div className="card">
      <div className="sec-head">
        <span className="sec-icon">⚡</span>
        <div>
          <div className="sec-title">Optimize Architecture</div>
          <div className="sec-sub">Rebuild for a specific goal — updates the full analysis above</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: result ? 16 : 0 }}>
        {opts.map(o => (
          <button key={o.type} onClick={() => optimize(o.type)} disabled={!!loading}
            style={{
              flex: 1, minWidth: 130, background: loading === o.type ? "var(--accent-glow)" : "var(--surface)",
              border: `1px solid ${loading === o.type ? "var(--accent-hi)" : "var(--border)"}`,
              borderRadius: 10, padding: "12px 14px", cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", textAlign: "left", opacity: loading && loading !== o.type ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = "var(--border-hi)"; }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.borderColor = o.type === loading ? "var(--accent-hi)" : "var(--border)"; }}}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>{o.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>{o.label}</div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>
              {loading === o.type ? "Optimizing..." : o.desc}
            </div>
          </button>
        ))}
      </div>
      {error && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 10 }}>{error}</p>}
      {result && (
        <div style={{ background: "var(--surface)", borderRadius: 10, padding: 16, border: "1px solid var(--border)", marginTop: 4 }}>
          <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.6, marginBottom: 12 }}>{result.summary}</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            {Object.entries(result.metrics_delta || {}).map(([k, v]) => (
              <div key={k} style={{ background: "var(--card)", borderRadius: 8, padding: "8px 12px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", textTransform: "uppercase", marginBottom: 2 }}>
                  {k.replace(/_/g, " ")}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, fontFamily: "var(--mono)",
                  color: String(v).startsWith("-") ? "var(--green)" : String(v).startsWith("+") ? "var(--cyan)" : "var(--t1)" }}>
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {(result.changes || []).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--t2)" }}>
                <span style={{ color: "var(--accent-hi)", flexShrink: 0 }}>→</span>
                <span style={{ lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHAT PANEL ───────────────────────────────────────────────────────────────

function ChatPanel({ analysis, formData, conversationHistory, setConversationHistory, onAnalysisUpdated }) {
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory, loading]);

  const send = async (msg) => {
    const message = (msg || input).trim();
    if (!message || loading) return;
    setInput("");

    const newHistory = [...conversationHistory, { role: "user", content: message }];
    setConversationHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, analysis, conversationHistory: newHistory, newMessage: message }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      setConversationHistory(prev => [...prev, { role: "assistant", content: json.reply }]);
      if (json.updated_analysis) onAnalysisUpdated(json.updated_analysis);
    } catch (e) {
      setConversationHistory(prev => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Make this 50% cheaper",
    "What if our volume doubles?",
    "Add real-time streaming",
    "Simplify for a 2-person team",
    "Add multilingual support",
    "How does this change with HIPAA?",
    "What's the biggest risk here?",
    "Redesign for a fintech use case",
  ];

  return (
    <div className="card">
      <div className="sec-head">
        <span className="sec-icon">💬</span>
        <div>
          <div className="sec-title">Refine with Chanakya</div>
          <div className="sec-sub">
            {conversationHistory.length === 0
              ? "Ask questions or request changes — conversation memory lasts this session"
              : `${Math.ceil(conversationHistory.length / 2)} exchange${conversationHistory.length > 2 ? "s" : ""} · session memory active`}
          </div>
        </div>
      </div>

      {conversationHistory.length === 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)}
              style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 20, padding: "5px 13px", fontSize: 11,
                color: "var(--t2)", cursor: "pointer", fontFamily: "var(--font)",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-hi)"; e.currentTarget.style.color = "var(--t1)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--t2)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {conversationHistory.length > 0 && (
        <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, paddingRight: 4 }}>
          {conversationHistory.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%",
                background: msg.role === "user" ? "var(--accent)" : "var(--surface)",
                border: `1px solid ${msg.role === "user" ? "transparent" : "var(--border)"}`,
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px", fontSize: 13,
                color: msg.role === "user" ? "#fff" : "var(--t1)",
                lineHeight: 1.55,
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "16px 16px 16px 4px", padding: "12px 16px",
                display: "flex", gap: 5, alignItems: "center",
              }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "var(--t3)",
                    animation: `pulse-ring 1s ${d}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          className="field"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask Chanakya to refine, explain, or redesign..."
          disabled={loading}
          style={{ flex: 1 }}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="btn-primary" style={{ padding: "0 20px", flexShrink: 0, fontSize: 16 }}>
          {loading ? "…" : "↑"}
        </button>
      </div>
    </div>
  );
}


// ─── COLLAPSIBLE CARD ─────────────────────────────────────────────────────────

function CollapsibleCard({ icon, title, subtitle, defaultOpen = true, accent, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card" style={accent ? { borderColor: accent } : {}}>
      <div onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}>
        <div className="sec-head" style={{ marginBottom: 0, flex: 1 }}>
          <span className="sec-icon">{icon}</span>
          <div>
            <div className="sec-title">{title}</div>
            {subtitle && <div className="sec-sub">{subtitle}</div>}
          </div>
        </div>
        <div style={{ color: "var(--t3)", fontSize: 12, marginLeft: 8, marginTop: 2, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>▼</div>
      </div>
      {open && <div style={{ marginTop: 18 }}>{children}</div>}
    </div>
  );
}


// ─── SWIMLANE DIAGRAM ─────────────────────────────────────────────────────────

function SwimlaneDiagram({ diagram }) {
  const [svg, setSvg]   = useState("");
  const [err, setErr]   = useState(false);
  const [view, setView] = useState("swimlane");

  useEffect(() => {
    if (!diagram || view !== "swimlane") return;
    let cancelled = false;
    const run = async () => {
      let tries = 0;
      while (!window.mermaid && tries < 30) { await new Promise(r => setTimeout(r, 200)); tries++; }
      if (cancelled || !window.mermaid) { setErr(true); return; }
      try {
        const { svg: s } = await window.mermaid.render("sw" + Date.now(), diagram);
        if (!cancelled) setSvg(s.replace(/style="max-width:[^"]*"/, 'style="min-width:900px;display:block;"').replace(/width="[0-9.]+px"/, '').replace(/height="[0-9.]+px"/, ''));
      } catch (e) { if (!cancelled) setErr(true); }
    };
    run();
    return () => { cancelled = true; };
  }, [diagram, view]);

  if (err) return null;

  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="sec-head" style={{ marginBottom: 0 }}>
          <span className="sec-icon">🏊</span>
          <div>
            <div className="sec-title">Swimlane View</div>
            <div className="sec-sub">Architecture by layer — easier to understand at a glance</div>
          </div>
        </div>
      </div>
      {!svg ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 0" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse-ring 1.2s ease-out infinite" }} />
          <p style={{ fontSize: 12, color: "var(--t3)" }}>Rendering swimlane...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", padding: 16 }}>
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
      )}
    </div>
  );
}

// ─── FLOW DIAGRAM ─────────────────────────────────────────────────────────────

function FlowDiagram({ diagram, components, agentMap, compact }) {
  const [svg, setSvg]           = useState("");
  const [err, setErr]           = useState(false);
  const [zoom, setZoom]         = useState(compact ? 0.5 : 0.65);
  const [pan, setPan]           = useState({ x: 20, y: 20 });
  const [dragging, setDrag]     = useState(false);
  const [dragStart, setStart]   = useState({ x: 0, y: 0 });
  const [activeNode, setActive] = useState(null);
  const containerRef            = useRef(null);
  const innerRef                = useRef(null);

  useEffect(() => {
    if (!diagram) return;
    let cancelled = false;
    const run = async () => {
      let tries = 0;
      while (!window.mermaid && tries < 30) { await new Promise(r => setTimeout(r, 200)); tries++; }
      if (cancelled || !window.mermaid) { setErr(true); return; }
      try {
        const { svg: s } = await window.mermaid.render("mf" + Date.now(), diagram);
        if (!cancelled) {
          const big = s
            .replace(/style="max-width:[^"]*"/, 'style="min-width:1000px;display:block;"')
            .replace(/width="[0-9.]+px"/, '')
            .replace(/height="[0-9.]+px"/, '');
          setSvg(big);
        }
      } catch (e) { if (!cancelled) setErr(true); }
    };
    run();
    return () => { cancelled = true; };
  }, [diagram]);

  // Add click listeners + style to SVG nodes after render
  useEffect(() => {
    if (!svg || !innerRef.current) return;
    const el = innerRef.current;

    // Style all nodes
    el.querySelectorAll('.node rect, .node circle, .node polygon, .node path').forEach(shape => {
      shape.style.cursor = 'pointer';
      shape.style.transition = 'filter 0.15s';
    });

    // Add hover + click to node groups
    el.querySelectorAll('.node').forEach(node => {
      node.style.cursor = 'pointer';

      node.addEventListener('mouseenter', () => {
        node.querySelectorAll('rect, polygon, circle').forEach(s => {
          s.style.filter = 'brightness(1.4)';
        });
      });
      node.addEventListener('mouseleave', () => {
        node.querySelectorAll('rect, polygon, circle').forEach(s => {
          s.style.filter = '';
        });
      });

      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const rawLabel = node.querySelector('.nodeLabel, text, .label')?.textContent?.trim()
          || node.textContent?.trim() || "";
        const nl = String.fromCharCode(10);
        const label = rawLabel.split(nl).join(' ').split(String.fromCharCode(13)).join(' ').trim();

        // Match against architecture components or agent map
        const allItems = [
          ...(components || []).map(c => ({ name: c.name, detail: c.role, tool: c.recommended_tool, why: c.why, type: 'component' })),
          ...(agentMap    || []).map(a => ({ name: a.agent, detail: a.role_in_use_case, tool: a.llm, why: a.llm_rationale, type: 'agent' })),
        ];

        const match = allItems.find(item => {
          const n = (item.name || '').toLowerCase();
          const l = label.toLowerCase();
          return n.includes(l.slice(0, 8)) || l.includes(n.slice(0, 8));
        });

        setActive({ label, match });
      });
    });

    // Dismiss on background click
    const container = containerRef.current;
    const dismiss = (e) => { if (e.target === container || e.target === innerRef.current?.parentElement) setActive(null); };
    container?.addEventListener('click', dismiss);
    return () => container?.removeEventListener('click', dismiss);
  }, [svg, components, agentMap]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setZoom(z => Math.max(0.2, Math.min(4, +(z * (e.deltaY > 0 ? 0.9 : 1.1)).toFixed(3))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [svg]);

  const onMouseDown = (e) => { if (e.button !== 0) return; setDrag(true); setStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const onMouseMove = (e) => { if (!dragging) return; setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp   = () => setDrag(false);

  if (err) return <p style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", padding: "16px 0" }}>Diagram unavailable.</p>;
  if (!svg) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "32px 0" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", animation: "pulse-ring 1.2s ease-out infinite" }} />
      <p style={{ fontSize: 12, color: "var(--t3)" }}>Rendering diagram...</p>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Controls */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center" }}>
        <button onClick={() => setZoom(z => Math.min(+(z+0.15).toFixed(2), 4))} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 15 }}>+</button>
        <button onClick={() => { setZoom(0.65); setPan({ x: 20, y: 20 }); }} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 11 }}>Reset</button>
        <button onClick={() => setZoom(z => Math.max(+(z-0.15).toFixed(2), 0.2))} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 15 }}>−</button>
        <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>{Math.round(zoom*100)}%</span>
        <span style={{ fontSize: 11, color: "var(--t4)", marginLeft: 4 }}>scroll to zoom · drag to pan · click node for details</span>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {/* Diagram */}
        <div ref={containerRef} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{ flex: 1, overflow: "hidden", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", height: 560, cursor: dragging ? "grabbing" : "grab", position: "relative", userSelect: "none" }}>
          <div ref={innerRef} style={{ position: "absolute", transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "top left", transition: dragging ? "none" : "transform 0.05s" }}
            dangerouslySetInnerHTML={{ __html: svg }} />
        </div>

        {/* Node detail panel */}
        {activeNode && (
          <div style={{ width: 240, flexShrink: 0, background: "var(--card)", border: "1px solid var(--accent)", borderRadius: 10, padding: 16, animation: "fadeUp 0.2s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="label" style={{ color: "var(--accent-hi)" }}>Node Details</span>
              <button onClick={() => setActive(null)} style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 10, lineHeight: 1.4 }}>{activeNode.label}</p>
            {activeNode.match ? (
              <>
                <div style={{ marginBottom: 8 }}>
                  <span className="label" style={{ marginBottom: 4 }}>Role</span>
                  <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, margin: 0 }}>{activeNode.match.detail}</p>
                </div>
                {activeNode.match.tool && (
                  <div style={{ marginBottom: 8 }}>
                    <span className="label" style={{ marginBottom: 4 }}>{activeNode.match.type === "agent" ? "Model" : "Tool"}</span>
                    <span className="badge badge-accent" style={{ fontSize: 10 }}>{activeNode.match.tool}</span>
                  </div>
                )}
                {activeNode.match.why && (
                  <div>
                    <span className="label" style={{ marginBottom: 4 }}>Why</span>
                    <p style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5, fontStyle: "italic", margin: 0 }}>{activeNode.match.why}</p>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: 11, color: "var(--t3)", fontStyle: "italic" }}>No additional details for this node.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── BUSINESS IMPACT CARD ─────────────────────────────────────────────────────


// ─── QUERY REFINEMENT ────────────────────────────────────────────────────────

function QueryRefinement({ problem, industry, dataTypes, onAccept }) {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [edited,  setEdited]  = useState("");
  const [shown,   setShown]   = useState(false);

  const refine = async () => {
    if (!problem || problem.length < 30) return;
    setLoading(true); setShown(true);
    try {
      const res  = await fetch("http://localhost:3001/api/refine-query", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, industry, dataTypes }),
      });
      const data = await res.json();
      setResult(data); setEdited(data.improved_prompt || problem);
    } catch (e) { setResult(null); }
    setLoading(false);
  };

  const col = (s) => s >= 8 ? "var(--green)" : s >= 5 ? "var(--amber)" : "var(--red)";

  return (
    <div style={{ marginTop: 8 }}>
      {!shown ? (
        <button onClick={refine} disabled={problem.length < 30}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--accent-glow)", border: "1px solid var(--accent-hi)", color: "#a5b4fc", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: problem.length < 30 ? "not-allowed" : "pointer", opacity: problem.length < 30 ? 0.4 : 1, fontFamily: "var(--font)" }}>
          ✨ Polish with AI
        </button>
      ) : loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse-ring 1.2s ease-out infinite" }} />
          <span style={{ fontSize: 12, color: "var(--t3)" }}>Refining your problem statement...</span>
        </div>
      ) : result ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>✨ AI-Polished Prompt</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>CLARITY</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: col(result.clarity_score), fontFamily: "var(--mono)" }}>{result.clarity_score}/10</span>
              </div>
            </div>
            <button onClick={() => { setShown(false); setResult(null); }}
              style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 13 }}>✕</button>
          </div>
          <textarea value={edited} onChange={e => setEdited(e.target.value)} rows={5}
            style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--accent-hi)", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "var(--t1)", fontFamily: "var(--font)", lineHeight: 1.65, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
          {result.what_i_added?.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {result.what_i_added.map((item, i) => (
                <span key={i} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "var(--green)" }}>+ {item}</span>
              ))}
              {(result.what_i_assumed||[]).map((item, i) => (
                <span key={i} style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "var(--amber)" }}>~ {item}</span>
              ))}
            </div>
          )}
          {result.missing_that_would_help?.length > 0 && (
            <p style={{ fontSize: 11, color: "var(--t3)", marginTop: 10, lineHeight: 1.6 }}>
              💡 Would help: {result.missing_that_would_help.join(" · ")}
            </p>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={() => onAccept(edited)}
              style={{ flex: 1, background: "var(--accent)", border: "none", borderRadius: 8, padding: "8px 0", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)" }}>
              Use this prompt
            </button>
            <button onClick={() => onAccept(problem)}
              style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 14px", color: "var(--t2)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}>
              Keep original
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


// ─── STAKEHOLDER SUMMARY ─────────────────────────────────────────────────────

function StakeholderSummary({ analysis, formData }) {
  const [persona,   setPersona]   = useState("executive");
  const [summary,   setSummary]   = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!analysis || generated) return;
    setLoading(true);
    setGenerated(true);
    fetch("http://localhost:3001/api/summarize", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis, formData }),
    }).then(r => r.json()).then(data => { setSummary(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [analysis]);

  const personas = [
    { id: "executive",   icon: "👔", label: "Executive"  },
    { id: "engineering", icon: "⚙",  label: "Engineering" },
    { id: "board",       icon: "📊", label: "Board"       },
  ];

  return (
    <div className="card" style={{ border: "1px solid rgba(99,102,241,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="sec-title" style={{ fontSize: 13, marginBottom: 2 }}>👥 Stakeholder Views</div>
          <div className="sec-sub">Same analysis, different audience</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {personas.map(p => (
            <button key={p.id} onClick={() => setPersona(p.id)}
              style={{ background: persona === p.id ? "var(--accent-glow)" : "var(--surface)", border: "1px solid " + (persona === p.id ? "var(--accent-hi)" : "var(--border)"), color: persona === p.id ? "#a5b4fc" : "var(--t3)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse-ring 1.2s ease-out infinite" }} />
          <span style={{ fontSize: 12, color: "var(--t3)" }}>Generating stakeholder views...</span>
        </div>
      ) : summary ? (
        <>
          {persona === "executive" && summary.executive && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "var(--surface)", borderLeft: "3px solid var(--accent)", borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)", margin: 0, lineHeight: 1.4 }}>{summary.executive.headline}</p>
              </div>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{summary.executive.situation}</p>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{summary.executive.recommendation}</p>
              {(summary.executive.bullets||[]).map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--t1)", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--cyan)", flexShrink: 0, marginTop: 1 }}>→</span>
                  <span style={{ lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
              {summary.executive.decision_needed && (
                <div style={{ background: "rgba(79,82,224,0.12)", border: "1px solid rgba(79,82,224,0.25)", borderRadius: 8, padding: "10px 14px" }}>
                  <span className="label" style={{ marginBottom: 4 }}>Decision Needed</span>
                  <p style={{ fontSize: 12, color: "var(--t1)", margin: 0, lineHeight: 1.55 }}>{summary.executive.decision_needed}</p>
                </div>
              )}
            </div>
          )}
          {persona === "engineering" && summary.engineering && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.7, fontWeight: 500, margin: 0 }}>{summary.engineering.tldr}</p>
              <div>
                <span className="label" style={{ marginBottom: 6 }}>Core Stack</span>
                <p style={{ fontSize: 12, fontFamily: "var(--mono)", color: "var(--cyan)", background: "var(--surface)", borderRadius: 6, padding: "6px 10px", margin: 0 }}>{summary.engineering.stack}</p>
              </div>
              <div>
                <span className="label" style={{ marginBottom: 6 }}>Key Architectural Decisions</span>
                {(summary.engineering.key_decisions||[]).map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--t2)", marginBottom: 6 }}>
                    <span style={{ color: "var(--accent-hi)", flexShrink: 0, fontFamily: "var(--mono)", fontSize: 10, marginTop: 2 }}>{i+1}.</span>
                    <span style={{ lineHeight: 1.55 }}>{d}</span>
                  </div>
                ))}
              </div>
              {summary.engineering.sprint_1 && (
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                  <span className="label" style={{ marginBottom: 4, color: "var(--green)" }}>Sprint 1 — Start Here</span>
                  <p style={{ fontSize: 12, color: "var(--t2)", margin: 0, lineHeight: 1.6 }}>{summary.engineering.sprint_1}</p>
                </div>
              )}
              {(summary.engineering.hardest_parts||[]).map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: "var(--amber)" }}>⚠ {h}</div>
              ))}
            </div>
          )}
          {persona === "board" && summary.board && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span className="label" style={{ marginBottom: 6 }}>Market Opportunity</span>
                <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.7, margin: 0 }}>{summary.board.opportunity}</p>
              </div>
              <div>
                <span className="label" style={{ marginBottom: 6 }}>Competitive Moat</span>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{summary.board.moat}</p>
              </div>
              <div>
                <span className="label" style={{ marginBottom: 6 }}>Risk-Adjusted View</span>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{summary.board.risk_adjusted_view}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ padding: "8px 20px", borderRadius: 30, fontWeight: 700, fontSize: 14, background: summary.board.verdict === "build" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.12)", color: summary.board.verdict === "build" ? "var(--green)" : "var(--amber)", border: "1px solid currentColor", textTransform: "uppercase" }}>
                  {summary.board.verdict}
                </div>
                <p style={{ fontSize: 12, color: "var(--t2)", margin: 0, flex: 1 }}>{summary.board.verdict_reason}</p>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

// ─── REQUIREMENTS EXPORT ─────────────────────────────────────────────────────

// ─── REQUIREMENTS EXPORT ─────────────────────────────────────────────────────

function RequirementsExport({ analysis: r, formData }) {
  const [loading, setLoading] = useState(false);
  const [doc, setDoc]         = useState(null);
  const [open, setOpen]       = useState(false);

  const stack   = formData?.existingStack || "Python, PostgreSQL, AWS";
  const isPy    = !stack.toLowerCase().includes("typescript") && !stack.toLowerCase().includes("node only");
  const lang    = isPy ? "python" : "typescript";
  const fileExt = lang === "python" ? "py" : "ts";

  const generateDoc = () => {
    if (doc) { setOpen(true); return; }
    setLoading(true);

    const pattern    = r.recommended_pattern?.name || "Multi-Agent";
    const components = r.architecture?.components || [];
    const agents     = r.agent_llm_map || [];
    const models     = r.models || [];
    const steps      = r.next_steps || [];
    const risks      = r.risks || [];

    const agentFiles = agents.map(a =>
      "    ├── " + (a.agent||"agent").toLowerCase().replace(/\s+/g,"_") + "." + fileExt
    ).join("\n");

    const modelEnvs = [...new Set(
      models.map(m => m.provider?.toUpperCase().replace(/\s+/g,"_"))
    )].filter(Boolean);

    const envVars = [
      ...modelEnvs.map(p =>
        p.includes("OPENAI")     ? "OPENAI_API_KEY=" :
        p.includes("ANTHROPIC")  ? "ANTHROPIC_API_KEY=" :
        p.includes("GOOGLE")     ? "GOOGLE_API_KEY=" :
        p + "_API_KEY="
      ),
      "POSTGRES_URL=postgresql://user:password@localhost:5432/db",
      "LANGFUSE_PUBLIC_KEY=",
      "LANGFUSE_SECRET_KEY=",
    ];

    const agentDefs = agents.map((a, i) => [
      "",
      "#### Agent " + (i+1) + ": " + a.agent,
      "- **Model:** " + a.llm,
      "- **Role:** " + a.role_in_use_case,
      "- **Tools:** " + (a.tools_used||[]).join(", "),
      "- **Rationale:** " + a.llm_rationale,
      "",
      "```" + lang,
      lang === "python"
        ? "# " + a.agent.toLowerCase().replace(/\s+/g,"_") + ".py\ndef run_" + a.agent.toLowerCase().replace(/[^a-z0-9]/g,"_") + "(state: dict) -> dict:\n    \"\"\"" + (a.role_in_use_case||"").slice(0,80) + "\"\"\"\n    # TODO: implement\n    pass"
        : "// " + a.agent.toLowerCase().replace(/\s+/g,"_") + ".ts\nexport async function run" + a.agent.replace(/\s+/g,"") + "(state: Record<string,unknown>) {\n  // TODO: " + (a.role_in_use_case||"").slice(0,80) + "\n}",
      "```",
    ].join("\n")).join("\n");

    const orchCode = lang === "python"
      ? ["```python", "# orchestrator.py — " + pattern, "from langgraph.graph import StateGraph, END", "from typing import TypedDict, Annotated", "import operator", "", "class AgentState(TypedDict):", "    messages: list", "    results: dict", "    errors: list", "", "def build_graph():", "    workflow = StateGraph(AgentState)",
          ...agents.map(a => "    workflow.add_node(\"" + a.agent.toLowerCase().replace(/[^a-z0-9]/g,"_") + "\", run_" + a.agent.toLowerCase().replace(/[^a-z0-9]/g,"_") + ")"),
          "    workflow.set_entry_point(\"" + (agents[0]?.agent||"start").toLowerCase().replace(/[^a-z0-9]/g,"_") + "\")",
          "    return workflow.compile()", "", "app = build_graph()", "```"].join("\n")
      : ["```typescript", "// orchestrator.ts — " + pattern, "import { StateGraph } from \"@langchain/langgraph\";",
          ...agents.map(a => "import { run" + a.agent.replace(/\s+/g,"") + " } from \"./agents/" + a.agent.toLowerCase().replace(/\s+/g,"_") + "\";"),
          "", "const workflow = new StateGraph({ channels: { messages: null, results: null } });",
          ...agents.map(a => "workflow.addNode(\"" + a.agent.toLowerCase().replace(/[^a-z0-9]/g,"_") + "\", run" + a.agent.replace(/\s+/g,"") + ");"),
          "// TODO: add edges", "```"].join("\n");

    const cursorrules = [
      "# .cursorrules — Generated by Chanakya AI Architecture Advisor",
      "",
      "## Project Context",
      "You are building a **" + pattern + "** AI system.",
      "Problem: " + (formData?.problem||"").slice(0,300),
      "",
      "## Architecture Decisions (already made — do not change)",
      "- Pattern: " + pattern,
      "- Language: " + lang,
      "- Stack: " + stack,
      "",
      "## Agents",
      ...agents.map(a => "- **" + a.agent + "**: " + a.llm + " — " + (a.role_in_use_case||"").slice(0,100)),
      "",
      "## Coding Standards",
      "- Use structured outputs (JSON schema) for all agent responses",
      "- Every agent accepts and returns AgentState",
      "- Include Langfuse tracing on every LLM call",
      "- Handle rate limits with exponential backoff",
      "- Every agent needs fallback on primary model failure",
      "- Log every decision for audit trail",
      "",
      "## Implementation Order",
      ...steps.slice(0,5).map((s,i) => (i+1) + ". " + (s.action||"Step "+(i+1))),
    ].join("\n");

    const modelTable = agents.map(a => {
      const m = models.find(x => (x.name||"").includes((a.llm||"").split(" ")[0]) || (a.llm||"").includes((x.name||"").split(" ")[0]));
      return "| " + a.agent + " | " + a.llm + " | $" + (m?.input_cost||"—") + " | $" + (m?.output_cost||"—") + " |";
    }).join("\n");

    const fullDoc = [
      "# AI System Requirements",
      "> Generated by **Chanakya — AI Strategy & Architecture Advisor**",
      "> Pattern: " + pattern + " | Industry: " + (formData?.industry||"Enterprise") + " | Stack: " + stack,
      "",
      "---",
      "",
      "## Problem Statement",
      formData?.problem || "",
      "",
      "## Architecture Decision",
      "**Recommended Pattern:** " + pattern,
      "**Confidence:** " + (r.recommended_pattern?.confidence||"High"),
      "**Time to Value:** " + (r.recommended_pattern?.time_to_value||"6-8 weeks"),
      "",
      "### Why This Pattern",
      r.orchestration_reasoning?.chosen_because || r.recommended_pattern?.rationale || "",
      "",
      "---",
      "",
      "## Agent Definitions",
      agentDefs,
      "",
      "---",
      "",
      "## Model Strategy",
      "| Agent | Model | Input/1M | Output/1M |",
      "|-------|-------|----------|-----------|",
      modelTable,
      "",
      "---",
      "",
      "## File Structure",
      "```",
      "project/",
      "├── " + (lang==="python" ? "agents/" : "src/agents/"),
      agentFiles,
      "├── " + (lang==="python" ? "orchestrator.py" : "src/orchestrator.ts"),
      "├── .env",
      "├── .cursorrules",
      "└── README.md",
      "```",
      "",
      "---",
      "",
      "## Orchestrator Starter Code",
      orchCode,
      "",
      "---",
      "",
      "## Environment Variables",
      "```bash",
      ...envVars,
      "```",
      "",
      "---",
      "",
      "## Implementation Plan",
      ...steps.slice(0,6).map((s,i) => [
        "",
        "### Phase " + (i+1) + ": " + (s.action||"Step "+(i+1)),
        "- **Priority:** " + (s.priority||"High"),
        "- **Timeline:** " + (s.timeline||"1-2 weeks"),
        "- [ ] TODO",
      ].join("\n")),
      "",
      "---",
      "",
      "## Risks",
      ...risks.slice(0,3).map(risk => "- **" + (risk.severity||"Medium") + ":** " + (risk.description||"")),
      "",
      "---",
      "*Generated by Chanakya — AI Strategy & Architecture Advisor*",
    ].join("\n");

    setDoc({ fullDoc, cursorrules });
    setOpen(true);
    setLoading(false);
  };

  const openInClaude = () => {
    const brief = [
      "I have an AI architecture brief from Chanakya. Help me build this step by step.",
      "",
      "**Pattern:** " + (r.recommended_pattern?.name||""),
      "**Problem:** " + (formData?.problem||"").slice(0,300),
      "**Stack:** " + stack,
      "**Decision:** " + (r.orchestration_reasoning?.chosen_because||r.recommended_pattern?.rationale||"").slice(0,300),
      "",
      "**Agents:**",
      ...(r.agent_llm_map||[]).slice(0,5).map(a => "- " + a.agent + ": " + a.llm + " — " + (a.role_in_use_case||"").slice(0,100)),
      "",
      "Start by: creating the project structure, setting up the orchestrator, then implementing " + (r.agent_llm_map?.[0]?.agent||"the first agent") + " first.",
      "Ask me clarifying questions if needed.",
    ].join("\n");
    window.open("https://claude.ai/new?q=" + encodeURIComponent(brief), "_blank");
  };

  const exportForCursor = () => {
    if (!doc) { generateDoc(); return; }
    [
      ["REQUIREMENTS.md", doc.fullDoc],
      [".cursorrules",    doc.cursorrules],
      ["README.md",       "# AI System\nGenerated by Chanakya.\n\nSee REQUIREMENTS.md for full spec.\n\n## Setup\n```bash\npip install langgraph langchain langchain-openai langfuse\ncp .env.example .env\n```"],
    ].forEach(([name, content]) => {
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={generateDoc}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--accent-glow)", border: "1px solid var(--accent-hi)", color: "#a5b4fc", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)" }}>
          {loading ? "⏳ Generating..." : "📄 Generate Requirements"}
        </button>
        <button onClick={openInClaude}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t2)", borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}>
          ⊹ Open in Claude
        </button>
        <button onClick={exportForCursor}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t2)", borderRadius: 8, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}>
          ⌗ Export for Cursor
        </button>
      </div>

      {open && doc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, width: "100%", maxWidth: 820, maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>📄 AI Requirements Document</div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>Claude · Cursor · Copilot · any AI coding assistant</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => navigator.clipboard?.writeText(doc.fullDoc)}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t2)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}>Copy</button>
                <button onClick={openInClaude}
                  style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)" }}>⊹ Open in Claude</button>
                <button onClick={exportForCursor}
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t2)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}>⌗ Cursor Files</button>
                <button onClick={() => setOpen(false)}
                  style={{ background: "none", border: "none", color: "var(--t3)", cursor: "pointer", fontSize: 16 }}>✕</button>
              </div>
            </div>
            <pre style={{ flex: 1, overflowY: "auto", padding: "16px 20px", fontSize: 11, color: "var(--t2)", lineHeight: 1.7, fontFamily: "var(--mono)", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
              {doc.fullDoc}
            </pre>
          </div>
        </div>
      )}
    </>
  );
}


function BizImpactCard({ data }) {
  const [showScenario, setShowScenario] = useState(false);
  const [showWho,      setShowWho]      = useState(false);

  return (
    <div className="card" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
      {/* Headline */}
      <div style={{ background: "var(--surface)", borderLeft: "3px solid var(--accent)", borderRadius: "0 10px 10px 0", padding: "14px 16px", marginBottom: 16 }}>
        <span className="label" style={{ marginBottom: 4 }}>What This Means For Your Business</span>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)", lineHeight: 1.5, margin: 0 }}>{data.headline}</p>
      </div>

      {/* AI vs Human — compact 2-col */}
      <div className="results-grid-2" style={{ marginBottom: 14 }}>
        <div style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
          <span className="label" style={{ color: "var(--cyan)", marginBottom: 5 }}>🤖 AI Decides</span>
          <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.55, margin: 0 }}>{data.what_ai_decides}</p>
        </div>
        <div style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 12px", border: "1px solid var(--border)" }}>
          <span className="label" style={{ color: "var(--amber)", marginBottom: 5 }}>👤 Human Decides</span>
          <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.55, margin: 0 }}>{data.what_human_decides}</p>
        </div>
      </div>

      {/* Success metrics — compact chips */}
      {data.success_metrics?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {data.success_metrics.map((m, i) => (
            <div key={i} style={{ background: "var(--green-dim)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "var(--green)" }}>✓ {m}</div>
          ))}
        </div>
      )}

      {/* Expandable sections */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setShowScenario(!showScenario)}
          style={{ background: showScenario ? "var(--accent-glow)" : "var(--surface)", border: "1px solid " + (showScenario ? "var(--accent-hi)" : "var(--border)"), color: showScenario ? "#a5b4fc" : "var(--t3)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}>
          {showScenario ? "▼" : "▶"} Real scenario walkthrough
        </button>
        {data.who_benefits?.length > 0 && (
          <button onClick={() => setShowWho(!showWho)}
            style={{ background: showWho ? "var(--accent-glow)" : "var(--surface)", border: "1px solid " + (showWho ? "var(--accent-hi)" : "var(--border)"), color: showWho ? "#a5b4fc" : "var(--t3)", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "var(--font)" }}>
            {showWho ? "▼" : "▶"} Who benefits ({data.who_benefits.length} roles)
          </button>
        )}
      </div>

      {showScenario && (
        <div style={{ marginTop: 12, background: "var(--surface)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
          <span className="label" style={{ marginBottom: 6 }}>Full Scenario</span>
          <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.75, margin: 0 }}>{data.use_case_walkthrough}</p>
          {data.what_changes_for_team && (
            <>
              <hr className="divider" style={{ margin: "12px 0" }} />
              <span className="label" style={{ marginBottom: 6 }}>What Changes For The Team</span>
              <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, margin: 0 }}>{data.what_changes_for_team}</p>
            </>
          )}
        </div>
      )}

      {showWho && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {data.who_benefits.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span className="badge badge-accent" style={{ flexShrink: 0, marginTop: 1 }}>{w.role}</span>
              <span style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55 }}>{w.how}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



// ─── CONSTRAINT FLAGS ─────────────────────────────────────────────────────────

function ConstraintFlags({ formData, analysis }) {
  if (!formData) return null;
  const flags = [];

  const pattern = analysis?.recommended_pattern?.name || "";
  const complexity = analysis?.recommended_pattern?.complexity || "";

  if (formData.techConstraints) {
    const tc = formData.techConstraints.toLowerCase();
    if ((pattern.includes("Multi-Agent") || pattern.includes("RLM")) && tc.includes("no langchain")) {
      flags.push({ type: "warn", icon: "⚠", label: "Tech Conflict", msg: "Your team has no LangChain experience but this pattern uses LangGraph (LangChain ecosystem). Consider Temporal or custom orchestration." });
    }
    if (pattern.includes("MCP") && tc.includes("on-prem")) {
      flags.push({ type: "warn", icon: "⚠", label: "Deployment Conflict", msg: "MCP Integration assumes cloud APIs but you require on-premise deployment. Review each MCP server's self-hosting options." });
    }
  }

  if (formData.teamConstraints) {
    const tc = formData.teamConstraints.toLowerCase();
    const match = tc.match(/(\d+)\s*(ml|ai|eng|developer|person|people)/);
    const teamSize = match ? parseInt(match[1]) : null;
    if (teamSize && teamSize <= 2 && complexity === "High") {
      flags.push({ type: "error", icon: "🚨", label: "Team Size Risk", msg: `${teamSize}-person team building High complexity architecture is high risk. Consider reducing scope to Medium complexity MVP first.` });
    }
  }

  if (formData.implBudget) {
    const budget = parseInt(formData.implBudget);
    if (budget < 50000 && complexity === "High") {
      flags.push({ type: "warn", icon: "⚠", label: "Budget Tension", msg: `$${(budget/1000).toFixed(0)}K implementation budget for High complexity architecture is tight. Typical range is $80K–$200K. Consider phased delivery.` });
    }
  }

  if (formData.timeline) {
    const tl = formData.timeline.toLowerCase();
    const weekMatch = tl.match(/(\d+)\s*week/);
    const weeks = weekMatch ? parseInt(weekMatch[1]) : null;
    if (weeks && weeks < 6 && complexity === "High") {
      flags.push({ type: "error", icon: "🚨", label: "Timeline Risk", msg: `${weeks}-week MVP for High complexity architecture is aggressive. Recommended minimum is 8–10 weeks. Consider reducing initial scope.` });
    }
  }

  if (formData.techConstraints) flags.push({ type: "info", icon: "📌", label: "Tech Stack", msg: formData.techConstraints });
  if (formData.teamConstraints) flags.push({ type: "info", icon: "👥", label: "Team", msg: formData.teamConstraints });
  if (formData.timeline)        flags.push({ type: "info", icon: "⏱", label: "Timeline", msg: formData.timeline });
  if (formData.implBudget)      flags.push({ type: "info", icon: "💵", label: "Impl Budget", msg: `$${parseInt(formData.implBudget).toLocaleString()}` });
  if (formData.specificRegs)    flags.push({ type: "info", icon: "⚖", label: "Regulation", msg: formData.specificRegs });

  if (!flags.length) return null;

  const colorMap = { error: "rgba(248,113,113,0.15)", warn: "rgba(245,158,11,0.12)", info: "rgba(99,102,241,0.1)" };
  const borderMap = { error: "rgba(248,113,113,0.4)", warn: "rgba(245,158,11,0.35)", info: "rgba(99,102,241,0.25)" };
  const textMap   = { error: "var(--red)", warn: "var(--amber)", info: "var(--t3)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
      {flags.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: colorMap[f.type], border: `1px solid ${borderMap[f.type]}`, borderRadius: 8, padding: "8px 12px" }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>{f.icon}</span>
          <div>
            <span style={{ fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, color: textMap[f.type], textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 6 }}>{f.label}</span>
            <span style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{f.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FLOATING CHAT ────────────────────────────────────────────────────────────

function FloatingChat({ analysis, formData, conversationHistory, setConversationHistory, onAnalysisUpdated }) {
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const messagesEndRef           = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationHistory, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setLoading(true);
    const userMsg = { role: "user", content: msg };
    setConversationHistory(h => [...h, userMsg]);
    try {
      const res = await fetch("http://localhost:3001/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData, analysis, conversationHistory: [...conversationHistory, userMsg], newMessage: msg }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConversationHistory(h => [...h, { role: "assistant", content: data.reply || "Done." }]);
      if (data.updated_analysis && onAnalysisUpdated) onAnalysisUpdated(data.updated_analysis);
    } catch (e) {
      setConversationHistory(h => [...h, { role: "assistant", content: "Sorry, something went wrong — try again." }]);
    }
    setLoading(false);
  };

  const suggestions = [
    "Why this pattern over alternatives?",
    "How does this handle scale?",
    "Estimate the team needed to build this",
    "What could go wrong in week 1?",
    "Which agent is most critical?",
    "How long until we see ROI?",
  ];

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(!open)}
        style={{ position: "fixed", bottom: 28, right: 28, width: 52, height: 52, borderRadius: "50%", background: open ? "var(--accent-hi)" : "var(--accent)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 20px rgba(79,82,224,0.5)", zIndex: 999, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {open ? "✕" : "💬"}
      </button>

      {/* Slide-in panel */}
      {open && (
        <div style={{ position: "fixed", bottom: 92, right: 28, width: 360, maxHeight: "70vh", background: "var(--card)", border: "1px solid var(--accent)", borderRadius: 14, display: "flex", flexDirection: "column", zIndex: 998, boxShadow: "0 8px 40px rgba(0,0,0,0.5)", animation: "fadeUp 0.2s ease" }}>
          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 14 }}>💬</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Ask Chanakya</div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{conversationHistory.filter(m => m.role === "user").length} exchanges · session active</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {conversationHistory.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 11, color: "var(--t3)", marginBottom: 6 }}>Quick questions:</p>
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setInput(s); }}
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "var(--t2)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font)" }}>{s}</button>
                ))}
              </div>
            ) : conversationHistory.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "85%", background: m.role === "user" ? "var(--accent)" : "var(--surface)", color: m.role === "user" ? "#fff" : "var(--t1)", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "8px 12px", fontSize: 12, lineHeight: 1.6 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 4, padding: "8px 0" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: `pulse-ring 1.2s ease-out ${i*0.2}s infinite` }} />)}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask anything about this architecture..."
              style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 10px", fontSize: 12, color: "var(--t1)", fontFamily: "var(--font)", outline: "none" }} />
            <button onClick={send} disabled={!input.trim() || loading}
              style={{ background: "var(--accent)", border: "none", borderRadius: 8, padding: "7px 12px", color: "#fff", cursor: "pointer", fontSize: 14, opacity: (!input.trim() || loading) ? 0.4 : 1 }}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}


// ─── PPT GENERATION ──────────────────────────────────────────────────────────

async function downloadPPT(r, formData) {
  const pptx = new window.PptxGenJS();

  // Brand colors
  const NAVY   = "070C16";
  const INDIGO = "4F52E0";
  const CYAN   = "22D3EE";
  const WHITE  = "F1F5F9";
  const GRAY   = "64748B";
  const GREEN  = "10B981";
  const AMBER  = "F59E0B";
  const RED    = "F87171";

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Chanakya — AI Strategy & Architecture Advisor";

  const addBg = (slide) => {
    slide.background = { color: NAVY };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.05, fill: { color: INDIGO } });
  };

  const titleStyle  = { fontFace: "Arial", fontSize: 28, bold: true, color: WHITE };
  const heading     = { fontFace: "Arial", fontSize: 16, bold: true, color: WHITE };
  const body        = { fontFace: "Arial", fontSize: 11, color: "94A3B8" };
  const mono        = { fontFace: "Courier New", fontSize: 10, color: CYAN };
  const accent      = { fontFace: "Arial", fontSize: 12, bold: true, color: CYAN };

  // ── SLIDE 1: Title ──────────────────────────────────────────────────────
  const s1 = pptx.addSlide();
  addBg(s1);
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 1.5, w: "100%", h: 3, fill: { color: "0C1423" } });
  s1.addText("CHANAKYA", { x: 0.5, y: 0.3, w: 9, h: 0.4, ...mono, fontSize: 11, bold: true });
  s1.addText("AI Strategy & Architecture Advisor", { x: 0.5, y: 0.65, w: 9, h: 0.3, fontFace: "Arial", fontSize: 11, color: GRAY });
  s1.addText((formData?.problem || "Architecture Brief").slice(0, 100), { x: 0.5, y: 1.7, w: 9, h: 1.2, ...titleStyle, fontSize: 22, breakLine: true });
  s1.addText(r.recommended_pattern?.name || "Architecture Recommendation", { x: 0.5, y: 3.1, w: 5, h: 0.45, fontFace: "Arial", fontSize: 14, bold: true, color: WHITE, fill: { color: INDIGO }, align: "center", shape: pptx.ShapeType.roundRect });
  s1.addText([
    { text: "Industry: ", options: { bold: true, color: GRAY } },
    { text: (formData?.industry || "—") + "  ·  ", options: { color: GRAY } },
    { text: "Confidence: ", options: { bold: true, color: GRAY } },
    { text: r.recommended_pattern?.confidence || "—", options: { color: CYAN } },
  ], { x: 0.5, y: 3.75, w: 9, h: 0.3, fontFace: "Arial", fontSize: 11 });

  // ── SLIDE 2: Executive Summary ──────────────────────────────────────────
  const s2 = pptx.addSlide();
  addBg(s2);
  s2.addText("EXECUTIVE BRIEF", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
  s2.addText('"' + (r.recommended_pattern?.one_liner || "") + '"', { x: 0.5, y: 0.7, w: 9, h: 1.0, fontFace: "Arial", fontSize: 15, italic: true, color: WHITE, breakLine: true });
  s2.addText(r.executive_summary || "", { x: 0.5, y: 1.9, w: 9, h: 1.5, ...body, fontSize: 12, breakLine: true });
  const stats = [
    { l: "CONFIDENCE",   v: r.recommended_pattern?.confidence || "—",   col: GREEN },
    { l: "COMPLEXITY",   v: r.recommended_pattern?.complexity || "—",    col: AMBER },
    { l: "TIME TO VALUE",v: r.recommended_pattern?.time_to_value || "—", col: CYAN  },
  ];
  stats.forEach((s, i) => {
    const x = 0.5 + i * 3.2;
    s2.addShape(pptx.ShapeType.rect, { x, y: 3.55, w: 3, h: 1.0, fill: { color: "0C1423" }, line: { color: s.col, width: 1 } });
    s2.addText(s.l, { x, y: 3.62, w: 3, h: 0.25, fontFace: "Courier New", fontSize: 8, color: s.col, align: "center", bold: true });
    s2.addText(s.v, { x, y: 3.9, w: 3, h: 0.5, fontFace: "Arial", fontSize: 14, bold: true, color: WHITE, align: "center" });
  });

  // ── SLIDE 3: Should You Build AI ────────────────────────────────────────
  if (r.should_build_ai && typeof r.should_build_ai === "object") {
    const s3 = pptx.addSlide();
    addBg(s3);
    s3.addText("SHOULD YOU BUILD THIS AI SYSTEM?", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
    s3.addText(r.should_build_ai.verdict || "", { x: 0.5, y: 0.7, w: 4, h: 0.5, fontFace: "Arial", fontSize: 18, bold: true, color: GREEN, fill: { color: "0C1423" }, align: "center" });
    s3.addText(r.should_build_ai.reasoning || "", { x: 0.5, y: 1.35, w: 9, h: 1.0, ...body, fontSize: 12, breakLine: true });
    const roi = r.should_build_ai.roi_analysis;
    if (roi) {
      const roiStats = [
        { l: "ANNUAL SAVING",  v: roi.annual_saving_usd ? "$" + Math.round(roi.annual_saving_usd/1000) + "K" : "—" },
        { l: "PAYBACK",        v: roi.payback_period_months ? roi.payback_period_months + " months" : "—" },
        { l: "3-YEAR ROI",     v: roi.three_year_roi_percent ? roi.three_year_roi_percent + "%" : "—" },
      ];
      roiStats.forEach((rs, i) => {
        const x = 0.5 + i * 3.2;
        s3.addShape(pptx.ShapeType.rect, { x, y: 2.5, w: 3, h: 0.9, fill: { color: "0C1423" }, line: { color: CYAN, width: 1 } });
        s3.addText(rs.l, { x, y: 2.55, w: 3, h: 0.25, fontFace: "Courier New", fontSize: 8, color: GRAY, align: "center" });
        s3.addText(rs.v, { x, y: 2.8, w: 3, h: 0.45, fontFace: "Arial", fontSize: 16, bold: true, color: CYAN, align: "center" });
      });
    }
    if (r.should_build_ai.comparison) {
      const rows = [["Metric","Before","After (AI)","Improvement"]];
      Object.entries(r.should_build_ai.comparison).forEach(([k, v]) => {
        if (v?.before) rows.push([k.replace(/_/g," "), v.before, v.after, v.improvement]);
      });
      s3.addTable(rows, { x: 0.5, y: 3.55, w: 9.5, colW: [2.2, 2.5, 2.5, 2.3], fontFace: "Arial", fontSize: 10, color: WHITE, fill: "0C1423", border: { color: "1E293B" }, align: "left", autoPage: false });
    }
  }

  // ── SLIDE 4: Business Impact ─────────────────────────────────────────
  if (r.business_impact) {
    const s4 = pptx.addSlide();
    addBg(s4);
    s4.addText("BUSINESS IMPACT", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
    s4.addText(r.business_impact.headline || "", { x: 0.5, y: 0.7, w: 9, h: 0.8, fontFace: "Arial", fontSize: 16, bold: true, color: WHITE, breakLine: true });
    s4.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.6, w: 4.6, h: 1.8, fill: { color: "0C1423" }, line: { color: CYAN, width: 1 } });
    s4.addText("🤖  AI DECIDES", { x: 0.6, y: 1.65, w: 4.3, h: 0.3, fontFace: "Arial", fontSize: 10, bold: true, color: CYAN });
    s4.addText(r.business_impact.what_ai_decides || "", { x: 0.6, y: 1.95, w: 4.3, h: 1.3, ...body, breakLine: true });
    s4.addShape(pptx.ShapeType.rect, { x: 5.3, y: 1.6, w: 4.7, h: 1.8, fill: { color: "0C1423" }, line: { color: AMBER, width: 1 } });
    s4.addText("👤  HUMAN DECIDES", { x: 5.4, y: 1.65, w: 4.4, h: 0.3, fontFace: "Arial", fontSize: 10, bold: true, color: AMBER });
    s4.addText(r.business_impact.what_human_decides || "", { x: 5.4, y: 1.95, w: 4.4, h: 1.3, ...body, breakLine: true });
    if (r.business_impact.success_metrics?.length) {
      s4.addText("SUCCESS METRICS", { x: 0.5, y: 3.55, w: 9, h: 0.25, ...mono });
      r.business_impact.success_metrics.slice(0, 4).forEach((m, i) => {
        s4.addText("✓  " + m, { x: 0.5 + (i % 2) * 5, y: 3.85 + Math.floor(i/2) * 0.4, w: 4.8, h: 0.35, fontFace: "Arial", fontSize: 10, color: GREEN });
      });
    }
  }

  // ── SLIDE 5: Architecture + Rationale ───────────────────────────────────
  const s5 = pptx.addSlide();
  addBg(s5);
  s5.addText("RECOMMENDED ARCHITECTURE", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
  s5.addText(r.recommended_pattern?.name || "", { x: 0.5, y: 0.7, w: 9, h: 0.5, fontFace: "Arial", fontSize: 22, bold: true, color: WHITE });
  s5.addText(r.recommended_pattern?.rationale || "", { x: 0.5, y: 1.35, w: 9, h: 1.4, ...body, fontSize: 12, breakLine: true });
  if (r.orchestration_reasoning?.chosen_because) {
    s5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.9, w: 0.05, h: 1.5, fill: { color: INDIGO } });
    s5.addText("WHY THIS WON", { x: 0.7, y: 2.9, w: 9, h: 0.25, ...mono, fontSize: 9 });
    s5.addText(r.orchestration_reasoning.chosen_because, { x: 0.7, y: 3.2, w: 9.3, h: 1.0, ...body, fontSize: 12, breakLine: true });
  }

  // ── SLIDE 6: Model Strategy ──────────────────────────────────────────
  if (r.models?.length) {
    const s6 = pptx.addSlide();
    addBg(s6);
    s6.addText("MODEL STRATEGY", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
    const mRows = [["Model","Provider","Role","Input/1M","Output/1M"]];
    r.models.forEach(m => {
      mRows.push([m.name || "", m.provider || "", (m.why || "").slice(0, 50), "$" + (m.input_cost || "—"), "$" + (m.output_cost || "—")]);
    });
    s6.addTable(mRows, { x: 0.5, y: 0.75, w: 9.5, colW: [2.8, 1.5, 3.0, 1.1, 1.1], fontFace: "Arial", fontSize: 10, color: WHITE, fill: "0C1423", border: { color: "1E293B" } });
    if (r.cost_model) {
      s6.addText("COST MODEL", { x: 0.5, y: 3.2, w: 9, h: 0.25, ...mono });
      s6.addText(`Per request: $${r.cost_model.per_request?.p50 || "—"} (p50) · $${r.cost_model.per_request?.p90 || "—"} (p90)`, { x: 0.5, y: 3.5, w: 9, h: 0.3, fontFace: "Arial", fontSize: 13, bold: true, color: CYAN });
      const projRows = [["Volume","Monthly Cost"]];
      (r.cost_model.monthly_estimates || []).forEach(e => projRows.push([e.volume || "", e.cost || ""]));
      if (projRows.length > 1) s6.addTable(projRows, { x: 0.5, y: 3.9, w: 5, fontFace: "Arial", fontSize: 10, color: WHITE, fill: "0C1423", border: { color: "1E293B" } });
    }
  }

  // ── SLIDE 7: Risks + Next Steps ──────────────────────────────────────
  const s7 = pptx.addSlide();
  addBg(s7);
  s7.addText("RISKS & ACTION PLAN", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
  (r.risks || []).slice(0, 3).forEach((risk, i) => {
    const col = risk.severity === "High" ? RED : AMBER;
    s7.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.7 + i * 1.0, w: 4.5, h: 0.85, fill: { color: "0C1423" }, line: { color: col, width: 1 } });
    s7.addText((risk.severity || "") + " — " + (risk.description || "").slice(0, 80), { x: 0.6, y: 0.72 + i * 1.0, w: 4.3, h: 0.8, fontFace: "Arial", fontSize: 10, color: WHITE, breakLine: true });
  });
  (r.next_steps || []).slice(0, 5).forEach((step, i) => {
    s7.addShape(pptx.ShapeType.rect, { x: 5.3, y: 0.7 + i * 0.68, w: 0.35, h: 0.35, fill: { color: INDIGO }, rectRadius: 0.05 });
    s7.addText(String(i + 1), { x: 5.3, y: 0.7 + i * 0.68, w: 0.35, h: 0.35, fontFace: "Arial", fontSize: 11, bold: true, color: WHITE, align: "center" });
    s7.addText((step.action || "").slice(0, 100), { x: 5.75, y: 0.72 + i * 0.68, w: 4.25, h: 0.32, fontFace: "Arial", fontSize: 10, color: WHITE });
  });

  // ── SLIDE 8: Tools + CTA ───────────────────────────────────────────
  const s8 = pptx.addSlide();
  addBg(s8);
  s8.addText("RECOMMENDED TOOLS", { x: 0.5, y: 0.3, w: 9, h: 0.3, ...mono });
  (r.recommended_tools || []).slice(0, 6).forEach((tool, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.5 + col * 5;
    const y = 0.7 + row * 1.15;
    s8.addShape(pptx.ShapeType.rect, { x, y, w: 4.7, h: 1.0, fill: { color: "0C1423" }, line: { color: "1E293B", width: 1 } });
    s8.addText((tool.name || "") + "  [" + (tool.category || "") + "]", { x: x + 0.1, y: y + 0.07, w: 4.5, h: 0.28, fontFace: "Arial", fontSize: 11, bold: true, color: WHITE });
    s8.addText(tool.why || "", { x: x + 0.1, y: y + 0.36, w: 4.5, h: 0.55, fontFace: "Arial", fontSize: 9, color: GRAY, breakLine: true });
  });
  s8.addShape(pptx.ShapeType.rect, { x: 0, y: 4.3, w: "100%", h: 1.2, fill: { color: "0C1423" } });
  s8.addText("Built with Chanakya — AI Strategy & Architecture Advisor", { x: 0.5, y: 4.45, w: 9.5, h: 0.3, fontFace: "Arial", fontSize: 11, color: GRAY, align: "center" });
  s8.addText("⬡  chanakya.ai", { x: 0.5, y: 4.8, w: 9.5, h: 0.35, fontFace: "Arial", fontSize: 14, bold: true, color: WHITE, align: "center" });

  pptx.writeFile({ fileName: "chanakya-architecture-brief.pptx" });
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────

function Results({ result: r, formData, resources, conversationHistory, setConversationHistory, onAnalysisUpdated, onReset }) {
  const [copied, setCopied] = useState(false);
  const [tab,    setTab]    = useState("brief");

  const brief = () => `ARCHITECTURE BRIEF — Generated by Chanakya
${"═".repeat(60)}

PROBLEM STATEMENT
${formData.problem}

Industry: ${formData.industry}  |  Volume: ${formData.volume}  |  Latency: ${formData.latency}
Accuracy: ${formData.accuracyStakes}  |  Budget: ${formData.budget}/mo
Compliance: ${(formData.compliance || []).join(", ") || "None"}
Stack: ${formData.existingStack || "Not specified"}

═══════════════════════════════════════════════════════════
EXECUTIVE SUMMARY
${r.executive_summary}

RECOMMENDATION: ${r.recommended_pattern.name}
Confidence: ${r.recommended_pattern.confidence}  |  Complexity: ${r.recommended_pattern.complexity}  |  Time to value: ${r.recommended_pattern.time_to_first_value}

"${r.recommended_pattern.one_liner}"

${r.recommended_pattern.rationale}

Key architectural decision:
${r.architecture.key_decision}

═══════════════════════════════════════════════════════════
ARCHITECTURE

Components:
${r.architecture.components.map(c =>
  `  ${c.name}  →  ${c.recommended_tool}\n  ${c.role}\n  ${c.why}`
).join("\n\n")}

Data Flow:
${r.architecture.data_flow.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

═══════════════════════════════════════════════════════════
MODEL RECOMMENDATIONS
${r.models.map(m =>
  `  [${m.role}] ${m.name} · ${m.provider}\n  Input: $${m.input_cost_per_1m}/1M  |  Output: $${m.output_cost_per_1m}/1M\n  ${m.why}`
).join("\n\n")}

═══════════════════════════════════════════════════════════
COST MODEL
Assumptions: ${r.cost_model.assumptions}
Per-request (p50): ${fmtCost(r.cost_model.per_request.p50_usd)}  |  (p90): ${fmtCost(r.cost_model.per_request.p90_usd)}
Breakdown: ${r.cost_model.per_request.breakdown}

Monthly projections:
  1K req/mo   → ${fmtMonthly(r.cost_model.monthly_estimates.low_1k_req)}/mo
  10K req/mo  → ${fmtMonthly(r.cost_model.monthly_estimates.medium_10k_req)}/mo
  100K req/mo → ${fmtMonthly(r.cost_model.monthly_estimates.high_100k_req)}/mo

Cost drivers: ${r.cost_model.cost_drivers.join("  ·  ")}
Optimizations:
${r.cost_model.optimization_tips.map(t => `  • ${t}`).join("\n")}

═══════════════════════════════════════════════════════════
ALTERNATIVE PATTERNS
${r.alternatives.map(a =>
  `  ${a.pattern}  (${a.cost_delta})\n  Tradeoff: ${a.tradeoff}\n  Choose if: ${a.choose_if}`
).join("\n\n")}

═══════════════════════════════════════════════════════════
RISKS & MITIGATIONS
${r.risks.map(x => `  [${x.severity}] ${x.risk}\n        → ${x.mitigation}`).join("\n\n")}

═══════════════════════════════════════════════════════════
NEXT STEPS
${r.next_steps.map((s, i) => `  ${i + 1}. [${s.priority}] ${s.step}\n     Effort: ${s.effort}  →  ${s.outcome}`).join("\n\n")}

${r.compliance_notes ? `═══════════════════════════════════════════════════════════\nCOMPLIANCE\n${r.compliance_notes}\n` : ""}
═══════════════════════════════════════════════════════════
WHY THIS APPROACH WINS
${r.differentiator}

Generated by Chanakya — AI Strategy & Architecture Advisor
`;

  const copy = () => {
    navigator.clipboard.writeText(brief()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const maxMonthly = Math.max(
    r.cost_model.monthly_estimates.low_1k_req || 0,
    r.cost_model.monthly_estimates.medium_10k_req || 0,
    r.cost_model.monthly_estimates.high_100k_req || 0,
    0.01
  );

  return (
    <div className="archon" style={{ paddingBottom: 60 }}>

      {/* Sticky topbar */}
      <div className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <div className="logo-mark">⬡</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>Chanakya</span>
          <span style={{ color: "var(--t3)", fontSize: 12 }}>/ Architecture Brief</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="copy-btn" onClick={copy}>
            {copied ? "✓ Copied!" : "Copy Brief"}
          </button>
          <button className="new-btn" onClick={onReset}>New Analysis</button>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)", position: "sticky", top: 52, zIndex: 90, overflowX: "auto", flexShrink: 0 }}>
        {[
          { id: "brief",        icon: "⬡", label: "Brief"        },
          { id: "architecture", icon: "🏗", label: "Architecture" },
          { id: "economics",    icon: "💰", label: "Economics"    },
          { id: "delivery",     icon: "🚀", label: "Action Plan"  },

        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "none", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "var(--accent-hi)" : "transparent"}`,
            padding: "12px 20px", marginBottom: -1,
            color: tab === t.id ? "var(--t1)" : "var(--t3)",
            fontFamily: "var(--font)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>


      <div style={{ maxWidth: 940, margin: "0 auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {tab === "brief" && <>


        {/* ── Business Impact (compact) ── */}
        {r.business_impact && (
          <BizImpactCard data={r.business_impact} />
        )}


        {/* ── Swimlane (Brief) ── */}
        {r.swimlane_diagram && (
          <SwimlaneDiagram diagram={r.swimlane_diagram} />
        )}

        {/* ── Should You Build This? ── */}
        {r.should_build_ai && typeof r.should_build_ai === "object" && (
          <div className="card" style={{ border: `1px solid ${r.should_build_ai.verdict?.startsWith("Strong Yes") ? "rgba(16,185,129,0.5)" : r.should_build_ai.verdict?.startsWith("Yes") ? "rgba(34,211,238,0.4)" : r.should_build_ai.verdict?.startsWith("Proceed") ? "rgba(245,158,11,0.4)" : "rgba(248,113,113,0.4)"}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <span className="label" style={{ marginBottom: 8 }}>Should You Build This AI System?</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ padding: "6px 20px", borderRadius: 30, fontWeight: 700, fontSize: 15, background: r.should_build_ai.verdict?.startsWith("Strong Yes") ? "rgba(16,185,129,0.15)" : r.should_build_ai.verdict?.startsWith("Yes") ? "rgba(34,211,238,0.12)" : r.should_build_ai.verdict?.startsWith("Proceed") ? "rgba(245,158,11,0.12)" : "rgba(248,113,113,0.12)", color: r.should_build_ai.verdict?.startsWith("Strong Yes") ? "var(--green)" : r.should_build_ai.verdict?.startsWith("Yes") ? "var(--cyan)" : r.should_build_ai.verdict?.startsWith("Proceed") ? "var(--amber)" : "var(--red)", border: "1px solid currentColor" }}>{r.should_build_ai.verdict}</div>
                  <span className="badge badge-default">{r.should_build_ai.confidence} confidence</span>
                </div>
              </div>
              {r.should_build_ai.roi_analysis && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[["Annual Saving", r.should_build_ai.roi_analysis.annual_saving_usd ? `$${(r.should_build_ai.roi_analysis.annual_saving_usd/1000).toFixed(0)}k` : "—", "var(--green)"],
                    ["Payback", r.should_build_ai.roi_analysis.payback_period_months ? `${r.should_build_ai.roi_analysis.payback_period_months} mo` : "—", "var(--cyan)"],
                    ["3-Year ROI", r.should_build_ai.roi_analysis.three_year_roi_percent ? `${r.should_build_ai.roi_analysis.three_year_roi_percent}%` : "—", "var(--cyan)"],
                  ].map(([l,v,col]) => (
                    <div key={l} className="stat-box" style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 18, fontFamily: "var(--mono)", fontWeight: 600, color: col }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", marginTop: 2 }}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, marginBottom: r.should_build_ai.comparison ? 16 : 0 }}>{r.should_build_ai.reasoning}</p>
            {r.should_build_ai.comparison && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>{["Metric","Before","After (AI)","Improvement"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border)", color: "var(--t3)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {Object.entries(r.should_build_ai.comparison).map(([key, row]) => row?.before && (
                      <tr key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 12px", color: "var(--t2)", textTransform: "capitalize" }}>{key.replace(/_/g," ")}</td>
                        <td style={{ padding: "8px 12px", color: "var(--t1)", fontFamily: "var(--mono)" }}>{row.before}</td>
                        <td style={{ padding: "8px 12px", color: "var(--cyan)", fontFamily: "var(--mono)" }}>{row.after}</td>
                        <td style={{ padding: "8px 12px", color: "var(--green)", fontFamily: "var(--mono)" }}>{row.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {r.should_build_ai.break_even_point && <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 12, fontStyle: "italic" }}>Break-even: {r.should_build_ai.break_even_point}</p>}
          </div>
        )}

        {/* ── Should You Build This? ── */}
        {r.should_build_ai && typeof r.should_build_ai === "object" && (
          <div className="card" style={{ border: `1px solid ${r.should_build_ai.verdict?.startsWith("Strong Yes") ? "rgba(16,185,129,0.5)" : r.should_build_ai.verdict?.startsWith("Yes") ? "rgba(34,211,238,0.4)" : r.should_build_ai.verdict?.startsWith("Proceed") ? "rgba(245,158,11,0.4)" : "rgba(248,113,113,0.4)"}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
              <div>
                <span className="label" style={{ marginBottom: 8 }}>Should You Build This AI System?</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ padding: "6px 20px", borderRadius: 30, fontWeight: 700, fontSize: 15, background: r.should_build_ai.verdict?.startsWith("Strong Yes") ? "rgba(16,185,129,0.15)" : r.should_build_ai.verdict?.startsWith("Yes") ? "rgba(34,211,238,0.12)" : r.should_build_ai.verdict?.startsWith("Proceed") ? "rgba(245,158,11,0.12)" : "rgba(248,113,113,0.12)", color: r.should_build_ai.verdict?.startsWith("Strong Yes") ? "var(--green)" : r.should_build_ai.verdict?.startsWith("Yes") ? "var(--cyan)" : r.should_build_ai.verdict?.startsWith("Proceed") ? "var(--amber)" : "var(--red)", border: "1px solid currentColor" }}>{r.should_build_ai.verdict}</div>
                  <span className="badge badge-default">{r.should_build_ai.confidence} confidence</span>
                </div>
              </div>
              {r.should_build_ai.roi_analysis && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[["Annual Saving", r.should_build_ai.roi_analysis.annual_saving_usd ? `$${(r.should_build_ai.roi_analysis.annual_saving_usd/1000).toFixed(0)}k` : "—", "var(--green)"],
                    ["Payback", r.should_build_ai.roi_analysis.payback_period_months ? `${r.should_build_ai.roi_analysis.payback_period_months} mo` : "—", "var(--cyan)"],
                    ["3-Year ROI", r.should_build_ai.roi_analysis.three_year_roi_percent ? `${r.should_build_ai.roi_analysis.three_year_roi_percent}%` : "—", "var(--cyan)"],
                  ].map(([l,v,col]) => (
                    <div key={l} className="stat-box" style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 18, fontFamily: "var(--mono)", fontWeight: 600, color: col }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", marginTop: 2 }}>{l.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, marginBottom: r.should_build_ai.comparison ? 16 : 0 }}>{r.should_build_ai.reasoning}</p>
            {r.should_build_ai.comparison && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>{["Metric","Before","After (AI)","Improvement"].map(h => <th key={h} style={{ textAlign: "left", padding: "8px 12px", borderBottom: "1px solid var(--border)", color: "var(--t3)", fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase" }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {Object.entries(r.should_build_ai.comparison).map(([key, row]) => row?.before && (
                      <tr key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 12px", color: "var(--t2)", textTransform: "capitalize" }}>{key.replace(/_/g," ")}</td>
                        <td style={{ padding: "8px 12px", color: "var(--t1)", fontFamily: "var(--mono)" }}>{row.before}</td>
                        <td style={{ padding: "8px 12px", color: "var(--cyan)", fontFamily: "var(--mono)" }}>{row.after}</td>
                        <td style={{ padding: "8px 12px", color: "var(--green)", fontFamily: "var(--mono)" }}>{row.improvement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {r.should_build_ai.break_even_point && <p style={{ fontSize: 12, color: "var(--t3)", marginTop: 12, fontStyle: "italic" }}>Break-even: {r.should_build_ai.break_even_point}</p>}
          </div>
        )}

        {/* ── Hero: Pattern Rec ── */}
        <div className="card fade-up-1" style={{ padding: 28, border: "1px solid var(--border-hi)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
            <div>
              <span className="label" style={{ marginBottom: 10 }}>Recommended Architecture</span>
              <div className="pattern-pill" style={{ background: patternGradient(r.recommended_pattern.name) }}>
                {r.recommended_pattern.name}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[
                { lbl: "Confidence", val: r.recommended_pattern.confidence,
                  col: r.recommended_pattern.confidence === "High" ? "var(--green)" : r.recommended_pattern.confidence === "Medium" ? "var(--amber)" : "var(--red)" },
                { lbl: "Complexity",      val: r.recommended_pattern.complexity,      col: "var(--t1)" },
                { lbl: "Time to Value",   val: r.recommended_pattern.time_to_first_value, col: "var(--cyan)" },
              ].map(s => (
                <div key={s.lbl} style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", textTransform: "uppercase", marginBottom: 4 }}>{s.lbl}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.col, fontFamily: "var(--mono)" }}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 17, fontWeight: 500, color: "var(--t1)", lineHeight: 1.5, marginBottom: 14, fontStyle: "italic" }}>
            "{r.recommended_pattern.one_liner}"
          </p>

          <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, marginBottom: 18 }}>
            {r.recommended_pattern.rationale}
          </p>

          <div style={{ background: "var(--surface)", borderLeft: "3px solid var(--accent)", borderRadius: "0 8px 8px 0", padding: "14px 16px" }}>
            <span className="label" style={{ marginBottom: 6 }}>Executive Summary</span>
            <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.7 }}>{r.executive_summary}</p>
          </div>
        </div>

        {/* ── Orchestration Flow moved to Architecture tab ── */}

        </> }

        {tab === "architecture" && <>

        <ConstraintFlags formData={formData} analysis={r} />

        {/* ── Swimlane Diagram ── */}
        {r.swimlane_diagram && (
          <SwimlaneDiagram diagram={r.swimlane_diagram} />
        )}


        {/* ── Orchestration Flow Diagram ── */}
        {r.mermaid_diagram && (
          <div className="card" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
            <div className="sec-head">
              <span className="sec-icon">🔁</span>
              <div>
                <div className="sec-title">Orchestration Flow</div>
                <div className="sec-sub">How data moves through this architecture end-to-end</div>
              </div>
            </div>
            <FlowDiagram diagram={r.mermaid_diagram} components={r.architecture?.components} agentMap={r.agent_llm_map} />
          </div>
        )}

        {/* ── Architecture + Flow ── */}
        <div className="results-grid-2 fade-up-3">
          {/* Components */}
          <div className="card">
            <div className="sec-head">
              <span className="sec-icon">🏗</span>
              <div>
                <div className="sec-title">Architecture Components</div>
                <div className="sec-sub">Recommended stack for this solution</div>
              </div>
            </div>
            {r.architecture.components.map((c, i) => (
              <div key={i} className="comp-item">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{c.name}</span>
                  <span className="badge badge-accent" style={{ whiteSpace: "nowrap" }}>{c.recommended_tool}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 6, lineHeight: 1.5 }}>{c.role}</p>
                <p style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5, fontStyle: "italic" }}>{c.why}</p>
                {c.alternatives?.length > 0 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--t4)" }}>alt:</span>
                    {c.alternatives.map(a => <span key={a} className="badge badge-default" style={{ fontSize: 10 }}>{a}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Data Flow */}
          <div className="card">
            <div className="sec-head">
              <span className="sec-icon">🔀</span>
              <div>
                <div className="sec-title">Data Flow</div>
                <div className="sec-sub" style={{ maxWidth: 240 }}>{r.architecture.key_decision}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", position: "relative", paddingLeft: 16 }}>
              <div style={{ position: "absolute", left: 13, top: 12, bottom: 12, width: 2, background: "linear-gradient(to bottom, var(--accent), var(--cyan))", borderRadius: 2, opacity: 0.4 }} />
              {r.architecture.data_flow.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16, position: "relative" }}>
                  <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: i === 0 ? "var(--accent)" : i === r.architecture.data_flow.length - 1 ? "var(--cyan)" : "var(--card)", border: "2px solid " + (i === 0 ? "var(--accent)" : i === r.architecture.data_flow.length - 1 ? "var(--cyan)" : "var(--border-hi)"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "var(--mono)", fontWeight: 600, color: i === 0 || i === r.architecture.data_flow.length - 1 ? "#fff" : "var(--t2)", zIndex: 1 }}>{i + 1}</div>
                  <div style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", marginTop: 2 }}>
                    <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, margin: 0 }}>{s}</p>
                  </div>
                </div>
              ))}
            </div>
            {r.differentiator && (
              <>
                <hr className="divider" style={{ marginBottom: 16 }} />
                <span className="label" style={{ marginBottom: 8 }}>Why This Wins</span>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>{r.differentiator}</p>
              </>
            )}
          </div>
        </div>

        </> }

        {tab === "economics" && <>

        <ConstraintFlags formData={formData} analysis={r} />

        {/* ── Models ── */}
        <div className="card fade-up-3">
          <div className="sec-head">
            <span className="sec-icon">🤖</span>
            <div>
              <div className="sec-title">Model Recommendations</div>
              <div className="sec-sub">Selected for your volume, latency, and accuracy requirements</div>
            </div>
          </div>
          <div className="results-grid-2">
            {r.models.map((m, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{m.name}</span>
                    <span style={{ fontSize: 11, color: "var(--t3)", marginLeft: 6 }}>{m.provider}</span>
                  </div>
                  <span className={`badge ${m.role === "Primary" ? "badge-accent" : "badge-default"}`}>{m.role}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 12, lineHeight: 1.55 }}>{m.why}</p>
                <hr className="divider" style={{ marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", marginBottom: 3 }}>Input / 1M</div>
                    <div style={{ fontSize: 14, fontFamily: "var(--mono)", fontWeight: 500, color: "var(--cyan)" }}>${m.input_cost_per_1m?.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", marginBottom: 3 }}>Output / 1M</div>
                    <div style={{ fontSize: 14, fontFamily: "var(--mono)", fontWeight: 500, color: "var(--cyan)" }}>${m.output_cost_per_1m?.toFixed(2)}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", marginBottom: 3 }}>Best for</div>
                    <div style={{ fontSize: 11, color: "var(--t2)" }}>{m.best_for}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cost Model ── */}
        <div className="card fade-up-4">
          <div className="sec-head">
            <span className="sec-icon">💰</span>
            <div>
              <div className="sec-title">Cost Model</div>
              <div className="sec-sub">{r.cost_model.assumptions}</div>
            </div>
          </div>

          <div className="results-grid-2" style={{ marginBottom: 20 }}>
            {/* Per-request */}
            <div className="stat-box">
              <span className="label">Per Request</span>
              <div style={{ display: "flex", gap: 24, marginBottom: 10 }}>
                <div>
                  <div className="stat-val" style={{ color: "var(--cyan)" }}>{fmtCost(r.cost_model.per_request.p50_usd)}</div>
                  <div className="stat-lbl">p50 typical</div>
                </div>
                <div>
                  <div className="stat-val" style={{ color: "var(--amber)" }}>{fmtCost(r.cost_model.per_request.p90_usd)}</div>
                  <div className="stat-lbl">p90 complex</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5 }}>{r.cost_model.per_request.breakdown}</p>
            </div>

            {/* Monthly */}
            <div className="stat-box">
              <span className="label">Monthly Projection</span>
              {[
                { label: "1K req/mo · Prototype",  key: "low_1k_req" },
                { label: "10K req/mo · Growth",    key: "medium_10k_req" },
                { label: "100K req/mo · Scale",    key: "high_100k_req" },
              ].map(row => {
                const v = r.cost_model.monthly_estimates[row.key] || 0;
                const pct = Math.max((v / maxMonthly) * 100, 4);
                return (
                  <div key={row.key} className="cost-row">
                    <div className="cost-label">
                      <span style={{ fontSize: 11, color: "var(--t2)" }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontFamily: "var(--mono)", fontWeight: 500, color: "var(--cyan)" }}>
                        {fmtMonthly(v)}/mo
                      </span>
                    </div>
                    <div className="cost-track">
                      <div className="cost-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span className="label">Cost Drivers</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {r.cost_model.cost_drivers.map((d, i) => (
                  <span key={i} className="badge badge-amber">{d}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: 2, minWidth: 240 }}>
              <span className="label">Optimization Tips</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {r.cost_model.optimization_tips.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--t2)" }}>
                    <span style={{ color: "var(--green)", flexShrink: 0 }}>✓</span>
                    <span style={{ lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Alternatives ── */}
        <div className="card">
          <div className="sec-head">
            <span className="sec-icon">⚖</span>
            <div>
              <div className="sec-title">Alternative Patterns</div>
              <div className="sec-sub">Tradeoff analysis — when to reconsider</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {r.alternatives.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, flexWrap: "wrap", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ flex: 2, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{a.pattern}</span>
                    <span className="badge badge-default" style={{ fontFamily: "var(--mono)" }}>{a.cost_delta}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{a.tradeoff}</p>
                </div>
                <div style={{ flex: 1, minWidth: 160, background: "var(--accent-glow)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                  <span className="label" style={{ color: "#a5b4fc", marginBottom: 5 }}>Choose if</span>
                  <p style={{ fontSize: 12, color: "var(--t1)", lineHeight: 1.5 }}>{a.choose_if}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        </> }

        {tab === "delivery" && <>

        {/* ── Risks + Next Steps ── */}
        <div className="results-grid-2">
          <div className="card">
            <div className="sec-head">
              <span className="sec-icon">⚠</span>
              <div><div className="sec-title">Risks & Mitigations</div></div>
            </div>
            {r.risks.map((x, i) => (
              <div key={i} className={`risk-card ${severityStyle(x.severity)}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span className={`badge ${severityBadge(x.severity)}`}>{x.severity}</span>
                  <span style={{ fontSize: 12, color: "var(--t1)", fontWeight: 500 }}>{x.risk}</span>
                </div>
                <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5 }}>→ {x.mitigation}</p>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="sec-head">
              <span className="sec-icon">🚀</span>
              <div>
                <div className="sec-title">Next Steps</div>
                <div className="sec-sub">Prioritized action plan</div>
              </div>
            </div>
            {r.next_steps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                  background: "var(--border)", color: "var(--t3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontFamily: "var(--mono)",
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>{s.step}</span>
                    <span className={`badge ${priorityBadge(s.priority)}`}>{s.priority}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--t3)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span>⏱ {s.effort}</span>
                    <span style={{ color: "var(--green)" }}>→ {s.outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Compliance ── */}
        {r.compliance_notes && (
          <CollapsibleCard icon="🔒" title="Compliance Considerations" defaultOpen={false} accent="rgba(245,158,11,0.3)">
            <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7 }}>{r.compliance_notes}</p>
          </CollapsibleCard>
        )}


        {/* ── Recommended Tools ── */}
        {r.recommended_tools?.length > 0 && (
          <div className="card">
            <div className="sec-head">
              <span className="sec-icon">🛠</span>
              <div>
                <div className="sec-title">Recommended Tools</div>
                <div className="sec-sub">Market tools that optimize this architecture — including ones you may not know</div>
              </div>
            </div>
            <div className="results-grid-2">
              {r.recommended_tools.map((tool, i) => (
                <a key={i} href={tool.url} target="_blank" rel="noreferrer"
                  style={{ textDecoration: "none", display: "block" }}>
                  <div className="comp-item" style={{ height: "100%", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{tool.name}</span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <span className="badge badge-cyan">{tool.category}</span>
                        {tool.open_source && <span className="badge badge-green">OSS</span>}
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--t2)", marginBottom: 8, lineHeight: 1.5 }}>{tool.why}</p>
                    {tool.cost_impact && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--green)", lineHeight: 1.4 }}>💰 {tool.cost_impact}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "var(--accent-hi)", marginTop: "auto" }}>
                      ↗ {(tool.url || "").replace(/^https?:\/\//, "").split("/")[0]}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Further Reading (Tavily) ── */}
        {resources?.length > 0 && (
          <div className="card">
            <div className="sec-head">
              <span className="sec-icon">📚</span>
              <div>
                <div className="sec-title">Further Reading</div>
                <div className="sec-sub">Curated articles, tutorials, and case studies for this architecture</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {resources.map((article, i) => (
                <a key={i} href={article.url} target="_blank" rel="noreferrer"
                  style={{ textDecoration: "none", display: "block" }}>
                  <div style={{
                    border: "1px solid var(--border)", borderRadius: 10,
                    padding: "12px 14px", height: "100%",
                    transition: "border-color 0.15s, background 0.15s",
                    cursor: "pointer",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-hi)"; e.currentTarget.style.background = "var(--card-hover)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)";    e.currentTarget.style.background = "transparent"; }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)", marginBottom: 5, lineHeight: 1.45 }}>
                      {article.title}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--t2)", lineHeight: 1.5, marginBottom: 8 }}>
                      {article.snippet}
                    </p>
                    <span style={{ fontSize: 10, color: "var(--accent-hi)", fontFamily: "var(--mono)" }}>
                      ↗ {(article.url || "").replace(/^https?:\/\/([^/]+).*/, "$1")}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        </> }

        {tab === "architecture" && <>

        {/* ── Agent Roles & LLM Assignment ── */}
        {r.agent_llm_map?.length > 0 && (
          <CollapsibleCard icon="🧠" title="Agent Roles & LLM Assignment"
            subtitle="What each agent does in your specific use case and which model powers it">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {r.agent_llm_map.map((a, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "var(--surface)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>{a.agent}</span>
                    <span className="badge badge-accent" style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{a.llm}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginBottom: 8 }}>{a.role_in_use_case}</p>
                  <p style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.5, fontStyle: "italic", marginBottom: a.tools_used?.length ? 8 : 0 }}>Why {a.llm}: {a.llm_rationale}</p>
                  {a.tools_used?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {a.tools_used.map(t => <span key={t} className="badge badge-cyan" style={{ fontSize: 10 }}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* ── Orchestration Reasoning ── */}
        {r.orchestration_reasoning && (
          <CollapsibleCard icon="🧩" title="Why This Orchestration"
            subtitle="Decision trail — ask the Refine tab to go deeper">
            <div style={{ background: "var(--surface)", borderLeft: "3px solid var(--accent)", borderRadius: "0 10px 10px 0", padding: "14px 16px", marginBottom: 16 }}>
              <span className="label" style={{ marginBottom: 6 }}>Decisive Reason</span>
              <p style={{ fontSize: 13, color: "var(--t1)", lineHeight: 1.7 }}>{r.orchestration_reasoning.chosen_because}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 14 }}>
              {(r.orchestration_reasoning.problem_signals || []).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--t2)", background: "var(--card)", borderRadius: 8, padding: "8px 12px", border: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--cyan)", flexShrink: 0 }}>◉</span>
                  <span style={{ lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
            {r.orchestration_reasoning.patterns_considered?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <span className="label" style={{ marginBottom: 8 }}>Patterns Ruled Out</span>
                {r.orchestration_reasoning.patterns_considered.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12, marginBottom: 6 }}>
                    <span className="badge badge-red" style={{ fontSize: 10, flexShrink: 0 }}>{p.pattern}</span>
                    <span style={{ color: "var(--t2)", lineHeight: 1.5 }}>{p.rejected_because}</span>
                  </div>
                ))}
              </div>
            )}
            {r.orchestration_reasoning.decision_chain && (
              <div>
                <span className="label" style={{ marginBottom: 6 }}>Decision Chain</span>
                <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.7, fontStyle: "italic" }}>{r.orchestration_reasoning.decision_chain}</p>
              </div>
            )}
          </CollapsibleCard>
        )}

        {/* ── RAG Strategy (only when RAG pattern) ── */}
        {r.rag_strategy && ["RAG","Agentic RAG","RAG + Multi-Agent"].some(p => r.recommended_pattern?.name?.includes(p)) && (
          <CollapsibleCard icon="🔍" title="RAG Strategy"
            subtitle="Chunking, embedding and retrieval configuration for this use case"
            accent="rgba(34,211,238,0.3)">
            <div className="results-grid-2" style={{ marginBottom: 14 }}>
              <div className="stat-box">
                <span className="label">Chunking</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 8 }}>{r.rag_strategy.chunking_strategy}</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[["CHUNK SIZE", r.rag_strategy.chunk_size + " tokens"],["OVERLAP", r.rag_strategy.chunk_overlap + " tokens"],["TOP-K", r.rag_strategy.top_k]].map(([l,v]) => (
                    <div key={l}><div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>{l}</div><div style={{ fontSize: 14, fontFamily: "var(--mono)", fontWeight: 500, color: "var(--cyan)" }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="stat-box">
                <span className="label">Embedding Model</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 2 }}>{r.rag_strategy.embedding_model}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>{r.rag_strategy.embedding_provider}</div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div><div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>COST/1M TOKENS</div><div style={{ fontSize: 14, fontFamily: "var(--mono)", fontWeight: 500, color: "var(--cyan)" }}>${r.rag_strategy.embedding_cost_per_1m_tokens?.toFixed(3)}</div></div>
                  <div><div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>COST/QUERY</div><div style={{ fontSize: 14, fontFamily: "var(--mono)", fontWeight: 500, color: "var(--amber)" }}>${r.rag_strategy.estimated_cost_per_query_usd?.toFixed(5)}</div></div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              {[["Similarity",r.rag_strategy.similarity_metric],["Threshold",r.rag_strategy.similarity_threshold],["Reranking",r.rag_strategy.reranking?(r.rag_strategy.reranker_tool||"Yes"):"No"]].map(([l,v]) => (
                <div key={l} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)", textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>{String(v)}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6, fontStyle: "italic" }}>{r.rag_strategy.why_this_strategy}</p>
          </CollapsibleCard>
        )}

        </> }

        {tab === "economics" && <>

        {/* ── Optimize Panel ── */}
        <OptimizePanel
          analysis={r}
          formData={formData}
          onAnalysisUpdated={onAnalysisUpdated}
        />

        </> }

        

        {tab === "brief" && <>

        {/* ── Requirements Export ── */}
        <div className="card" style={{ border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="sec-head" style={{ marginBottom: 14 }}>
            <span className="sec-icon">🛠</span>
            <div>
              <div className="sec-title">Ready to Build?</div>
              <div className="sec-sub">Export this architecture as AI-ready requirements for Claude, Cursor or any coding assistant</div>
            </div>
          </div>
          <RequirementsExport analysis={r} formData={formData} />
        </div>

        {/* ── CTA footer ── */}
        <div style={{
          background: "var(--accent-glow)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 14, padding: "28px 24px", textAlign: "center",
        }}>
          <span className="label" style={{ color: "#a5b4fc", marginBottom: 10, display: "block" }}>Built with Chanakya</span>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Ready to build this?</h3>
          <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 20 }}>Copy the brief to share with your team, or run a new analysis.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={copy} style={{ padding: "11px 28px" }}>
              {copied ? "✓ Copied!" : "Copy Consulting Brief"}
            </button>
            <button onClick={() => downloadPPT(r, formData)}
          style={{ background: "var(--accent-glow)", border: "1px solid var(--accent-hi)", color: "#a5b4fc", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          ⬇ Download PPT
        </button>
        <button className="btn-ghost" onClick={onReset}>New Analysis</button>
          </div>
        </div>
        </> }

      <FloatingChat
        analysis={r}
        formData={formData}
        conversationHistory={conversationHistory}
        setConversationHistory={setConversationHistory}
        onAnalysisUpdated={onAnalysisUpdated}
      />

      </div>
    </div>
  );
}

// ─── ERROR ────────────────────────────────────────────────────────────────────

function ErrorScreen({ message, onRetry }) {
  return (
    <div className="archon" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 400 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Analysis failed</h2>
        <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 8, lineHeight: 1.6 }}>{message}</p>
        <p style={{ fontSize: 12, color: "var(--t3)", marginBottom: 24, lineHeight: 1.6 }}>
          Running locally? Add your Anthropic API key via the ⚙ config on the landing screen.
        </p>
        <button className="btn-primary" onClick={onRetry}>← Try Again</button>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  problem: "", industry: "", dataTypes: [], latency: "",
  volume: "", accuracyStakes: "", budget: "", compliance: [], existingStack: "",
  currentProcess: "", currentMonthlyCost: "", currentTimePerTask: "",
  currentTimeUnit: "hours", currentAccuracy: "", currentTeamSize: "",
  techConstraints: "", teamConstraints: "", timeline: "", implBudget: "", specificRegs: "",
};

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [form, setForm]     = useState(INITIAL_FORM);
  const [progress, setProg] = useState(0);
  const [result,    setResult]    = useState(null);
  const [resources, setResources] = useState([]);
  const [error,     setError]     = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleAnalysisUpdated = (newAnalysis) =>
    setResult(prev => ({ ...prev, ...newAnalysis }));

  // Inject design system + Mermaid CDN
  useEffect(() => {
    const el = Object.assign(document.createElement("style"), { textContent: STYLES });
    document.head.appendChild(el);
    if (!document.getElementById("pptxgen-cdn")) {
      const p = document.createElement("script");
      p.id  = "pptxgen-cdn";
      p.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
      document.head.appendChild(p);
    }
    if (!document.getElementById("mermaid-cdn")) {
      const s = document.createElement("script");
      s.id  = "mermaid-cdn";
      s.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
      s.onload = () => window.mermaid?.initialize({
        startOnLoad: false,
        theme: "base",
        flowchart: { useMaxWidth: false, htmlLabels: false, padding: 28, nodeSpacing: 50, rankSpacing: 65 },
        themeVariables: {
          background:          "#0C1423",
          mainBkg:             "#1C2B50",
          nodeBorder:          "#4F52E0",
          clusterBkg:          "#111D35",
          titleColor:          "#F1F5F9",
          edgeLabelBackground: "#0C1423",
          primaryColor:        "#4F52E0",
          primaryTextColor:    "#F1F5F9",
          primaryBorderColor:  "#818CF8",
          secondaryColor:      "#162035",
          tertiaryColor:       "#0F1928",
          lineColor:           "#6366F1",
          fontFamily:          "Space Grotesk, -apple-system, sans-serif",
          fontSize:            "13px",
          specialStateColor:   "#22D3EE",
        },
      });
      document.head.appendChild(s);
    }
    return () => document.head.removeChild(el);
  }, []);

  const analyze = useCallback(async (data) => {
    setScreen("analyzing");
    setProg(0);
    setError("");

    let p = 0;
    const interval = setInterval(() => {
      p++;
      setProg(p);
      if (p >= ANA_STEPS.length - 1) clearInterval(interval);
    }, 800);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ formData: data }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      clearInterval(interval);
      setProg(ANA_STEPS.length);
      setResources(json.resources || []);
      setTimeout(() => { setResult(json.analysis); setScreen("results"); }, 700);
    } catch (e) {
      clearInterval(interval);
      setError(e.message || "Unknown error");
      setScreen("error");
    }
  }, []);

  const reset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError("");
    setConversationHistory([]);
    setScreen("landing");
  };

  const loadDemo = () => {
    setForm(DEMO);
    setScreen("intake");
  };

  return (
    <>
      {screen === "landing"   && <Landing  onStart={() => setScreen("intake")} onDemo={loadDemo} />}
      {screen === "intake"    && <Intake   formData={form} setFormData={setForm} onSubmit={() => analyze(form)} onBack={reset} />}
      {screen === "analyzing" && <Analyzing progress={progress} />}
      {screen === "results"   && result && <Results result={result} formData={form} resources={resources} conversationHistory={conversationHistory} setConversationHistory={setConversationHistory} onAnalysisUpdated={handleAnalysisUpdated} onReset={reset} />}
      {screen === "error"     && <ErrorScreen message={error} onRetry={reset} />}
    </>
  );
}
