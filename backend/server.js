
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "2mb" }));

// =============================================================================
// Chanakya v2 - single-file backend
// =============================================================================
// Goals:
// - Keep the same frontend contract: POST /api/analyze returns { analysis, resources }
// - Avoid one huge 16k-token completion
// - Generate complete logical sections with small agents
// - Add model fallback, retries, and clearer errors
// - Keep this as one server.js file for easy deployment
// =============================================================================

// -----------------------------------------------------------------------------
// CONFIG
// -----------------------------------------------------------------------------

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const splitList = (value, fallback) => {
  const raw = value || fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const MODEL_CHAINS = {
  // Put your preferred reliable model first. Free models are kept as last fallback.
  analyze: splitList(
    process.env.MODEL_ANALYZE,
    "google/gemini-2.5-flash,openai/gpt-4o-mini,meta-llama/llama-3.2-3b-instruct:free"
  ),
  light: splitList(
    process.env.MODEL_LIGHT,
    "google/gemini-2.5-flash,openai/gpt-4o-mini,meta-llama/llama-3.2-3b-instruct:free"
  ),
  research: splitList(
    process.env.MODEL_RESEARCH,
    "openai/gpt-4o-mini,google/gemini-2.5-flash,meta-llama/llama-3.2-3b-instruct:free"
  ),
};

const TOKENS = {
  architecture: Number(process.env.TOKENS_ARCHITECTURE || 2200),
  cost: Number(process.env.TOKENS_COST || 1400),
  business: Number(process.env.TOKENS_BUSINESS || 1400),
  diagram: Number(process.env.TOKENS_DIAGRAM || 1400),
  research: Number(process.env.TOKENS_RESEARCH || 1400),
  light: Number(process.env.TOKENS_LIGHT || 1200),
  optimize: Number(process.env.TOKENS_OPTIMIZE || 1800),
  refine: Number(process.env.TOKENS_REFINE || 1200),
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// -----------------------------------------------------------------------------
// JSON HELPERS
// -----------------------------------------------------------------------------

const stripCodeFences = (text = "") =>
  String(text)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

const extractJSON = (text) => {
  const s = stripCodeFences(text);
  try {
    return JSON.parse(s);
  } catch (_) {}

  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = s.slice(start, end + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  const arrStart = s.indexOf("[");
  const arrEnd = s.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    const candidate = s.slice(arrStart, arrEnd + 1);
    try {
      return JSON.parse(candidate);
    } catch (_) {}
  }

  throw new Error("Could not parse JSON from model response.");
};

const safeJSON = (value, max = 6000) => {
  try {
    const s = JSON.stringify(value ?? null);
    return s.length > max ? s.slice(0, max) + "..." : s;
  } catch (_) {
    return "null";
  }
};

const asArray = (value) => Array.isArray(value) ? value : value ? [value] : [];
const asObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

const cleanString = (value, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const parseMaybeJSON = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return value;
  const t = value.trim();
  if (!t || t.toLowerCase() === "null") return null;
  if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
    try { return JSON.parse(t); } catch (_) { return value; }
  }
  return value;
};

// -----------------------------------------------------------------------------
// LLM SERVICE WITH FALLBACKS
// -----------------------------------------------------------------------------

class ProviderError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ProviderError";
    this.status = details.status;
    this.model = details.model;
    this.raw = details.raw;
    this.retryAfter = details.retryAfter;
  }
}

const getRetryAfter = (res, errText) => {
  const h = res.headers.get("retry-after");
  if (h && !Number.isNaN(Number(h))) return Number(h);
  try {
    const parsed = JSON.parse(errText);
    return parsed?.error?.metadata?.retry_after_seconds || parsed?.error?.metadata?.retry_after_seconds_raw || null;
  } catch (_) {
    return null;
  }
};

async function callOpenRouter({
  messages,
  models = MODEL_CHAINS.light,
  maxTokens = TOKENS.light,
  temperature = 0.2,
  tools = undefined,
  toolChoice = undefined,
  retries = 1,
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new ProviderError("OPENROUTER_API_KEY is missing.", { status: 401 });
  }

  let lastError;

  for (const model of models) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const body = {
          model,
          max_tokens: maxTokens,
          temperature,
          messages,
        };
        if (tools) body.tools = tools;
        if (toolChoice) body.tool_choice = toolChoice;

        const res = await fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": process.env.APP_URL || "https://vinayakbist.com",
            "X-Title": "Chanakya - AI Strategy & Architecture Advisor",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errText = await res.text();
          const retryAfter = getRetryAfter(res, errText);
          const err = new ProviderError(`OpenRouter error ${res.status} for ${model}: ${errText}`, {
            status: res.status,
            model,
            raw: errText,
            retryAfter,
          });

          // Retry rate limits and transient provider failures.
          if ([408, 429, 500, 502, 503, 504].includes(res.status) && attempt < retries) {
            await sleep((retryAfter ? retryAfter * 1000 : 1200) + attempt * 500);
            continue;
          }
          throw err;
        }

        const data = await res.json();
        data._usedModel = model;
        return data;
      } catch (err) {
        lastError = err;
        // 402 usually means requested max tokens are too expensive for this model.
        // Move to the next model in the chain.
        if (err instanceof ProviderError && [400, 401, 402, 403, 404, 429, 500, 502, 503, 504].includes(err.status)) {
          break;
        }
        if (attempt >= retries) break;
        await sleep(1000 + attempt * 500);
      }
    }
  }

  throw lastError || new ProviderError("All LLM providers failed.");
}

async function callJSONAgent({ name, system, user, models, maxTokens, fallback, temperature = 0.2 }) {
  try {
    const res = await callOpenRouter({
      models,
      maxTokens,
      temperature,
      messages: [
        { role: "system", content: `${system}\n\nReturn ONLY valid JSON. No markdown. No backticks. No commentary.` },
        { role: "user", content: user },
      ],
    });
    const raw = res.choices?.[0]?.message?.content || "";
    const parsed = extractJSON(raw);
    if (parsed && typeof parsed === "object") {
      parsed._meta = { ...(parsed._meta || {}), agent: name, model: res._usedModel };
    }
    return parsed;
  } catch (err) {
    console.warn(`[${name}] falling back:`, err.message);
    return typeof fallback === "function" ? fallback(err) : fallback;
  }
}

// -----------------------------------------------------------------------------
// TAVILY + RESEARCH HELPERS
// -----------------------------------------------------------------------------

async function callTavily(query) {
  if (!process.env.TAVILY_API_KEY || !query) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
        include_raw_content: false,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r) => ({
      title: r.title || "Untitled",
      url: r.url || "",
      snippet: ((r.content || "").slice(0, 220).trim() || "No snippet") + "...",
      score: r.score || 0,
      query,
    }));
  } catch (e) {
    console.warn(`Tavily query failed: ${query}`, e.message);
    return [];
  }
}

async function searchPapers(query, limit = 5, yearFrom = 2020) {
  try {
    const q = encodeURIComponent(query);
    const lim = Math.min(limit || 5, 8);
    const yr = yearFrom ? `&year=${yearFrom}-` : "";
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${q}&limit=${lim}${yr}&fields=paperId,title,abstract,authors,year,citationCount,externalIds,venue`;
    const res = await fetch(url, { headers: { "User-Agent": "Chanakya/2.0" } });
    if (!res.ok) return [];
    const d = await res.json();
    return (d.data || []).map((p) => ({
      id: p.paperId,
      title: p.title,
      abstract: (p.abstract || "").slice(0, 700),
      authors: (p.authors || []).slice(0, 3).map((a) => a.name).join(", "),
      year: p.year,
      citations: p.citationCount,
      source_url: p.externalIds?.ArXiv ? `https://arxiv.org/abs/${p.externalIds.ArXiv}` : `https://semanticscholar.org/paper/${p.paperId}`,
    }));
  } catch (e) {
    console.warn("Semantic Scholar search failed:", e.message);
    return [];
  }
}

// -----------------------------------------------------------------------------
// DOMAIN LOGIC
// -----------------------------------------------------------------------------

function inferPattern(f = {}) {
  const problem = `${f.problem || ""} ${(f.dataTypes || []).join(" ")} ${f.existingStack || ""} ${(f.compliance || []).join(" ")}`.toLowerCase();
  const signals = [];

  if (/pdf|document|knowledge|policy|manual|contract|retrieval|search/.test(problem)) signals.push("documents/retrieval");
  if (/agent|workflow|approval|multi-step|orchestrat|handoff/.test(problem)) signals.push("multi-agent workflow");
  if (/salesforce|slack|jira|github|erp|crm|api|tool|mcp|integration/.test(problem)) signals.push("external tool integration");
  if (/legacy|database|warehouse|sql|data lake|s3|snowflake/.test(problem)) signals.push("enterprise data integration");
  if (/regulated|compliance|hipaa|sox|soc|bank|financial|audit|pii/.test(problem)) signals.push("regulated domain");

  const hasDocs = signals.includes("documents/retrieval");
  const hasAgents = signals.includes("multi-agent workflow");
  const hasTools = signals.includes("external tool integration");

  let pattern = "Simple LLM";
  if (hasDocs && hasAgents && hasTools) pattern = "Agentic RAG + MCP Integration";
  else if (hasDocs && hasAgents) pattern = "RAG + Multi-Agent";
  else if (hasDocs) pattern = "RAG";
  else if (hasAgents && hasTools) pattern = "MCP Integration + Multi-Agent";
  else if (hasAgents) pattern = "Multi-Agent";
  else if (hasTools) pattern = "MCP Integration";
  else if (/custom|pipeline|batch|etl|rules/.test(problem)) pattern = "Custom Pipeline";

  return { pattern, signals };
}

function contextBlock(f = {}) {
  return `Business Problem:\n${f.problem || ""}\n\nContext:\n- Industry: ${f.industry || "Not specified"}\n- Data Sources: ${(f.dataTypes || []).join(", ") || "Not specified"}\n- Latency: ${f.latency || "Not specified"}\n- Volume: ${f.volume || "Not specified"}\n- Accuracy: ${f.accuracyStakes || "Not specified"}\n- Budget: ${f.budget || "Not specified"}\n- Compliance: ${(f.compliance || []).join(", ") || "None"}\n- Existing Stack: ${f.existingStack || "Not specified"}\n- Technical Constraints: ${f.techConstraints || "None"}\n- Team Constraints: ${f.teamConstraints || "None"}\n- Timeline: ${f.timeline || "Not specified"}\n- Implementation Budget: ${f.implBudget || "Not specified"}\n- Specific Regulations: ${f.specificRegs || "None"}\n\nLegacy State:\n- Process: ${f.currentProcess || "Not provided"}\n- Monthly Cost: ${f.currentMonthlyCost || "Not provided"}\n- Time Per Task: ${f.currentTimePerTask || "Not provided"} ${f.currentTimeUnit || "hours"}\n- Team Size: ${f.currentTeamSize || "Not provided"}\n- Current Accuracy: ${f.currentAccuracy || "Not provided"}`;
}

function hasLegacyData(f = {}) {
  return !!(f.currentProcess || f.currentMonthlyCost || f.currentTimePerTask || f.currentTeamSize || f.currentAccuracy);
}

// -----------------------------------------------------------------------------
// FALLBACK SECTION GENERATORS
// -----------------------------------------------------------------------------

function fallbackArchitecture(f, inferred) {
  const pattern = inferred.pattern;
  return {
    executive_summary: `The recommended approach is ${pattern}, designed around the stated business constraints, data sources, and operational requirements. Start with a focused pilot that proves value on one high-friction workflow before expanding into deeper automation and governance.`,
    recommended_pattern: {
      name: pattern,
      confidence: inferred.signals.length >= 2 ? "High" : "Medium",
      one_liner: `${pattern} fits because the problem signals point to controlled orchestration rather than a generic chatbot.`,
      rationale: `The problem includes signals such as ${inferred.signals.join(", ") || "business workflow complexity"}. This makes the architecture better suited to a composed system with clear data boundaries, evaluation, and operational controls. The first version should be narrow enough to ship quickly but designed so retrieval, tools, and workflow automation can be added incrementally.`,
      complexity: inferred.signals.length >= 3 ? "High" : "Medium",
      time_to_first_value: "2-4 weeks",
    },
    architecture: {
      components: [
        { name: "Web App", role: "Captures the business problem and displays the recommendation", recommended_tool: "React", alternatives: ["Next.js", "Vue"], why: "Fits the current frontend and keeps deployment simple." },
        { name: "API Layer", role: "Validates requests and orchestrates AI agents", recommended_tool: "Express", alternatives: ["Fastify", "NestJS"], why: "Matches the current backend and is easy to operate on EC2." },
        { name: "LLM Router", role: "Chooses models and handles retries/fallbacks", recommended_tool: "OpenRouter", alternatives: ["OpenAI API", "Anthropic API", "Gemini API"], why: "Allows model switching without changing application logic." },
        { name: "Observability", role: "Tracks prompts, latency, failures, and cost", recommended_tool: "Langfuse", alternatives: ["Helicone", "OpenTelemetry"], why: "Makes AI behavior debuggable in production." },
      ],
      data_flow: ["User submits problem", "API validates input", "Agents generate focused sections", "Merger assembles final JSON", "Frontend renders report"],
      key_decision: "Keep the AI workflow section-based so no single model call must generate the entire consulting report.",
    },
    risks: [
      { risk: "Model output may be incomplete or invalid JSON", severity: "Medium", mitigation: "Generate smaller section-level JSON objects and validate each section before merging." },
      { risk: "Provider rate limits or insufficient credits", severity: "Medium", mitigation: "Use model fallback chains and reduce maximum output per agent." },
      { risk: "Recommendations may lack domain specificity", severity: "Medium", mitigation: "Use industry, compliance, and data-source signals in every agent prompt." },
    ],
    next_steps: [
      { step: "Build a narrow pilot workflow", priority: "High", effort: "1 week", outcome: "A working proof-of-value for one business process" },
      { step: "Add evaluation examples", priority: "High", effort: "2-3 days", outcome: "A baseline for accuracy and consistency" },
      { step: "Add observability", priority: "Medium", effort: "1-2 days", outcome: "Visibility into token cost, latency, and failures" },
    ],
    compliance_notes: (f.compliance || []).length ? `Design must account for ${(f.compliance || []).join(", ")}, including auditability, least-privilege access, and data retention controls.` : "",
    differentiator: "The approach turns architecture consulting into a repeatable workflow with separate reasoning, cost, research, and business-impact agents.",
    orchestration_reasoning: {
      problem_signals: inferred.signals.length ? inferred.signals : ["business workflow", "AI recommendation", "structured output"],
      patterns_considered: [
        { pattern: "Simple LLM", rejected_because: "Too fragile for detailed architecture recommendations and governance." },
        { pattern, rejected_because: "Not rejected; selected as the best fit." },
      ],
      chosen_because: `${pattern} best matches the detected signals and can be delivered incrementally while preserving governance and extensibility.`,
      key_tradeoffs_accepted: ["More backend orchestration", "Slightly higher implementation complexity for much better reliability"],
      decision_chain: "Detected domain signals, mapped them to AI architecture patterns, selected the lowest-complexity pattern that still supports the required data and workflow needs.",
    },
    agent_llm_map: [
      { agent: "Architecture Agent", role_in_use_case: "Chooses the solution pattern and components", llm: "Configured analysis model", llm_rationale: "Needs reasoning and structured JSON", tools_used: ["OpenRouter"] },
      { agent: "Research Agent", role_in_use_case: "Finds supporting papers and external resources", llm: "Configured research model", llm_rationale: "Summarizes retrieved evidence", tools_used: ["Semantic Scholar", "Tavily"] },
    ],
    rag_strategy: pattern.includes("RAG") ? {
      chunking_strategy: "recursive semantic splitting",
      chunk_size: 512,
      chunk_overlap: 64,
      embedding_model: "text-embedding-3-small",
      embedding_provider: "OpenAI",
      embedding_cost_per_1m_tokens: 0.02,
      similarity_metric: "cosine",
      similarity_threshold: 0.75,
      top_k: 5,
      reranking: true,
      reranker_tool: "Cohere Rerank or Jina Reranker",
      estimated_cost_per_query_usd: 0.0003,
      why_this_strategy: "Moderate chunks preserve context while keeping retrieval precise. Reranking improves answer quality for compliance-heavy or document-heavy workflows.",
    } : null,
  };
}

function fallbackCost(f) {
  return {
    models: [
      { role: "Primary", name: "Configured analysis model", provider: "OpenRouter", why: "Used for architecture reasoning and structured JSON generation", input_cost_per_1m: 0, output_cost_per_1m: 0, best_for: "Architecture analysis" },
      { role: "Fallback", name: "Configured fallback model", provider: "OpenRouter", why: "Used when the primary model is rate-limited or too expensive", input_cost_per_1m: 0, output_cost_per_1m: 0, best_for: "Continuity and cost control" },
    ],
    cost_model: {
      assumptions: `Estimates depend on traffic volume (${f.volume || "not specified"}), output length, and number of agent calls per analysis.`,
      cost_drivers: ["LLM output tokens", "Number of section agents", "External search calls"],
      per_request: { p50_usd: 0.01, p90_usd: 0.05, breakdown: "Multiple small LLM calls plus optional Tavily/Semantic Scholar retrieval" },
      monthly_estimates: { low_1k_req: 10, medium_10k_req: 90, high_100k_req: 800 },
      optimization_tips: ["Cache repeated analyses", "Use cheaper models for summaries/refinements", "Keep each section under a strict token budget"],
    },
    alternatives: [
      { pattern: "Single-call LLM", tradeoff: "Simpler implementation but fragile at long output lengths", cost_delta: "Can be more expensive due to high max_tokens", choose_if: "Only used for prototypes with short outputs" },
      { pattern: "Section-based agents", tradeoff: "More orchestration logic but higher reliability", cost_delta: "Often cheaper because each call has a smaller output ceiling", choose_if: "Recommended for production" },
    ],
  };
}

function fallbackBusiness(f) {
  const legacy = hasLegacyData(f);
  return {
    business_impact: {
      headline: "The team gets a repeatable AI-assisted architecture workflow instead of manual discovery and ad hoc recommendations.",
      what_changes_for_team: "Users move from manually structuring requirements and architecture options to reviewing a generated recommendation with cost, risk, and implementation guidance.",
      who_benefits: [
        { role: "Engineering leader", how: "Receives a clear architecture direction and tradeoff summary." },
        { role: "Product leader", how: "Gets faster validation of AI use cases and implementation effort." },
      ],
      use_case_walkthrough: "A stakeholder describes a business problem, the system identifies architecture signals, generates a recommended pattern, estimates cost and risk, and returns a practical implementation roadmap for review.",
      what_ai_decides: "The AI proposes patterns, components, costs, risks, and next steps.",
      what_human_decides: "Humans approve budget, compliance posture, implementation scope, and production rollout because those require business accountability.",
      success_metrics: ["Time to first recommendation", "Recommendation acceptance rate", "Pilot conversion rate"],
    },
    should_build_ai: legacy ? {
      verdict: "Yes with caveats",
      confidence: "Medium",
      reasoning: "Legacy data suggests there may be measurable efficiency gains, but ROI should be validated in a pilot before scaling.",
      roi_analysis: {
        current_annual_cost_usd: Number(f.currentMonthlyCost || 0) * 12 || 0,
        projected_ai_annual_cost_usd: 12000,
        annual_saving_usd: Math.max((Number(f.currentMonthlyCost || 0) * 12 || 0) - 12000, 0),
        payback_period_months: 6,
        three_year_roi_percent: 150,
        assumptions: "Assumes moderate usage, existing team oversight, and a narrow first workflow.",
      },
      comparison: {
        time: { before: `${f.currentTimePerTask || "Not measured"} ${f.currentTimeUnit || "hours"}`, after: "Minutes to hours", improvement: "Significant reduction after pilot validation" },
        cost_per_transaction: { before: "Manual effort", after: "AI-assisted review", improvement: "Lower marginal cost" },
        accuracy: { before: f.currentAccuracy ? `${f.currentAccuracy}%` : "Not measured", after: "Measured during pilot", improvement: "Depends on evaluation set" },
        headcount: { before: f.currentTeamSize ? `${f.currentTeamSize} people` : "Not measured", after: "Human oversight", improvement: "Less repetitive analysis" },
      },
      break_even_point: "Validate after the first pilot workflow.",
      risks_to_roi: ["Low adoption", "Poor data quality", "Unclear success metrics"],
    } : null,
  };
}

function fallbackDiagramTools(f, inferred) {
  return {
    swimlane_diagram: "graph LR\n  subgraph Input\n    A[Problem]\n  end\n  subgraph Orchestration\n    B[Planner]\n    C[Agents]\n  end\n  subgraph DataSources\n    D[Docs]\n    E[APIs]\n  end\n  subgraph Processing\n    F[Merge]\n  end\n  subgraph Output\n    G[Report]\n  end\n  A-->B-->C-->F-->G\n  D-->C\n  E-->C",
    mermaid_diagram: "flowchart TD\n  A[User Problem] --> B[API]\n  B --> C{Pattern?}\n  C --> D[Architecture Agent]\n  C --> E[Cost Agent]\n  C --> F[Research Agent]\n  D --> G[Merge Report]\n  E --> G\n  F --> G\n  G --> H[Final JSON]",
    recommended_tools: [
      { name: "Langfuse", category: "Observability", why: "Tracks prompts, latency, cost, and failures", url: "https://langfuse.com", cost_impact: "Reduces debugging time and helps control LLM spend", open_source: true },
      { name: "Helicone", category: "Observability", why: "Monitors LLM usage and can support caching", url: "https://helicone.ai", cost_impact: "Helps identify high-cost prompts", open_source: true },
      { name: "LangGraph", category: "Orchestration", why: "Useful if the section-agent workflow becomes more complex", url: "https://langchain-ai.github.io/langgraph/", cost_impact: "Improves reliability for multi-step workflows", open_source: true },
      { name: "Qdrant", category: "Vector DB", why: "Strong option if the solution needs RAG over documents", url: "https://qdrant.tech", cost_impact: "Open-source option can lower vector database cost", open_source: true },
    ],
    search_queries: [
      `${f.industry || "enterprise"} ${inferred.pattern} implementation best practices`,
      `${inferred.pattern} architecture cost optimization LLM application`,
      `${f.industry || "enterprise"} AI governance observability RAG multi-agent`,
    ],
  };
}

// -----------------------------------------------------------------------------
// AGENTS
// -----------------------------------------------------------------------------

async function researchAgent(f, inferred) {
  const baseQueries = [
    `${inferred.pattern} LLM architecture ${f.industry || "enterprise"}`,
    `${f.industry || "enterprise"} AI assistant RAG multi-agent system`,
    `LLM systems evaluation retrieval augmented generation agents`,
  ];

  const papersNested = await Promise.all(baseQueries.map((q) => searchPapers(q, 3, 2020)));
  const papers = [];
  for (const p of papersNested.flat()) {
    if (p.title && !papers.find((x) => x.title === p.title)) papers.push(p);
  }

  if (!papers.length) return [];

  const prompt = `Create 3-5 research_backing items from these retrieved papers.\n\nProblem context:\n${contextBlock(f)}\n\nPapers:\n${safeJSON(papers.slice(0, 8), 5000)}\n\nReturn ONLY a JSON array. Each item must have: claim, paper_title, authors_year, citation, key_finding, source_url, quote, relevance, supports_or_challenges.`;

  const result = await callJSONAgent({
    name: "researchAgent",
    models: MODEL_CHAINS.research,
    maxTokens: TOKENS.research,
    system: "You convert retrieved academic paper metadata into concise research-backing evidence for an AI architecture recommendation.",
    user: prompt,
    fallback: () => papers.slice(0, 4).map((p) => ({
      claim: p.title,
      paper_title: p.title,
      authors_year: `${(p.authors || "Unknown").split(",")[0]} et al., ${p.year || "n.d."}`,
      citation: `${p.authors || "Unknown"} (${p.year || "n.d."}). ${p.title}.`,
      key_finding: (p.abstract || "Relevant paper retrieved for this architecture pattern.").slice(0, 180),
      source_url: p.source_url,
      quote: (p.abstract || "No abstract available.").slice(0, 220),
      relevance: `Relevant to ${inferred.pattern} architecture decisions.`,
      supports_or_challenges: "supports",
    })),
  });

  return Array.isArray(result) ? result : asArray(result?.items);
}

async function architectureAgent(f, inferred, researchClaims) {
  const schema = `Return this JSON object with keys: executive_summary, recommended_pattern, architecture, risks, next_steps, compliance_notes, differentiator, orchestration_reasoning, agent_llm_map, rag_strategy. Keep every field complete but concise.`;
  const user = `${schema}\n\nDetected pattern: ${inferred.pattern}\nDetected signals: ${inferred.signals.join(", ") || "none"}\n\n${contextBlock(f)}\n\nResearch evidence summary:\n${safeJSON(researchClaims, 2500)}`;

  return callJSONAgent({
    name: "architectureAgent",
    models: MODEL_CHAINS.analyze,
    maxTokens: TOKENS.architecture,
    system: "You are Chanakya's Architecture Agent. You only generate the architecture, pattern, risks, next steps, compliance, differentiator, orchestration reasoning, agent map, and optional RAG strategy. Do not generate cost_model, business_impact, recommended_tools, or diagrams.",
    user,
    fallback: () => fallbackArchitecture(f, inferred),
  });
}

async function costAgent(f, architecture) {
  const user = `Generate ONLY this JSON object: {"models": [...], "cost_model": {...}, "alternatives": [...]}\n\nUse realistic but conservative estimates. Do not overclaim pricing. If exact current prices are unknown, use 0 and explain assumptions.\n\nContext:\n${contextBlock(f)}\n\nArchitecture summary:\n${safeJSON({ recommended_pattern: architecture.recommended_pattern, architecture: architecture.architecture }, 3500)}`;

  return callJSONAgent({
    name: "costAgent",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.cost,
    system: "You are Chanakya's Cost Agent. You estimate model choices, cost drivers, monthly estimates, and architectural alternatives. Return compact valid JSON.",
    user,
    fallback: () => fallbackCost(f),
  });
}

async function businessAgent(f, architecture, cost) {
  const user = `Generate ONLY this JSON object: {"business_impact": {...}, "should_build_ai": null or {...}}\n\nIf no legacy data is provided, should_build_ai must be null.\n\nContext:\n${contextBlock(f)}\n\nArchitecture summary:\n${safeJSON({ recommended_pattern: architecture.recommended_pattern, cost_model: cost.cost_model }, 3500)}`;

  return callJSONAgent({
    name: "businessAgent",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.business,
    system: "You are Chanakya's Business Impact Agent. You explain business outcomes, human-vs-AI decision boundaries, success metrics, and ROI when legacy data exists.",
    user,
    fallback: () => fallbackBusiness(f),
  });
}

async function diagramToolsAgent(f, architecture, inferred) {
  const user = `Generate ONLY this JSON object: {"swimlane_diagram":"...", "mermaid_diagram":"...", "recommended_tools":[...], "search_queries":[...]}\n\nMermaid requirements:\n- swimlane_diagram: graph LR with subgraphs Input, Orchestration, DataSources, Processing, Output.\n- mermaid_diagram: flowchart TD showing full flow.\n- Keep node labels short.\n\nTools: include 4-6 relevant tools from options like TurboPuffer, Langfuse, Qdrant, LlamaParse, Cohere Rerank, Jina Reranker, LangGraph, Helicone, Temporal, CrewAI, Unstructured.io.\n\nContext:\n${contextBlock(f)}\n\nArchitecture summary:\n${safeJSON(architecture, 3500)}`;

  return callJSONAgent({
    name: "diagramToolsAgent",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.diagram,
    system: "You are Chanakya's Diagram and Tools Agent. You only generate Mermaid diagrams, recommended tools, and search queries.",
    user,
    fallback: () => fallbackDiagramTools(f, inferred),
  });
}

// -----------------------------------------------------------------------------
// NORMALIZATION + MERGE
// -----------------------------------------------------------------------------

function normalizeAnalysis({ f, inferred, architecture, cost, business, diagram, research }) {
  const archFallback = fallbackArchitecture(f, inferred);
  const costFallback = fallbackCost(f);
  const businessFallback = fallbackBusiness(f);
  const diagramFallback = fallbackDiagramTools(f, inferred);

  const a = asObject(architecture);
  const c = asObject(cost);
  const b = asObject(business);
  const d = asObject(diagram);

  const recommendedPattern = asObject(a.recommended_pattern);
  const patternName = cleanString(recommendedPattern.name, inferred.pattern);

  return {
    executive_summary: cleanString(a.executive_summary, archFallback.executive_summary),
    recommended_pattern: {
      name: patternName,
      confidence: cleanString(recommendedPattern.confidence, archFallback.recommended_pattern.confidence),
      one_liner: cleanString(recommendedPattern.one_liner, archFallback.recommended_pattern.one_liner),
      rationale: cleanString(recommendedPattern.rationale, archFallback.recommended_pattern.rationale),
      complexity: cleanString(recommendedPattern.complexity, archFallback.recommended_pattern.complexity),
      time_to_first_value: cleanString(recommendedPattern.time_to_first_value, archFallback.recommended_pattern.time_to_first_value),
    },
    architecture: Object.keys(asObject(a.architecture)).length ? a.architecture : archFallback.architecture,
    models: asArray(c.models).length ? asArray(c.models) : costFallback.models,
    cost_model: Object.keys(asObject(c.cost_model)).length ? c.cost_model : costFallback.cost_model,
    alternatives: asArray(c.alternatives).length ? asArray(c.alternatives) : costFallback.alternatives,
    risks: asArray(a.risks).length ? asArray(a.risks) : archFallback.risks,
    next_steps: asArray(a.next_steps).length ? asArray(a.next_steps) : archFallback.next_steps,
    compliance_notes: cleanString(a.compliance_notes, archFallback.compliance_notes),
    differentiator: cleanString(a.differentiator, archFallback.differentiator),
    orchestration_reasoning: Object.keys(asObject(a.orchestration_reasoning)).length ? a.orchestration_reasoning : archFallback.orchestration_reasoning,
    agent_llm_map: asArray(a.agent_llm_map).length ? asArray(a.agent_llm_map) : archFallback.agent_llm_map,
    rag_strategy: parseMaybeJSON(a.rag_strategy) ?? (patternName.includes("RAG") ? archFallback.rag_strategy : null),
    business_impact: Object.keys(asObject(b.business_impact)).length ? b.business_impact : businessFallback.business_impact,
    should_build_ai: parseMaybeJSON(b.should_build_ai) ?? businessFallback.should_build_ai,
    swimlane_diagram: cleanString(d.swimlane_diagram, diagramFallback.swimlane_diagram),
    research_backing: asArray(research).length ? asArray(research) : [],
    mermaid_diagram: cleanString(d.mermaid_diagram, diagramFallback.mermaid_diagram),
    recommended_tools: asArray(d.recommended_tools).length ? asArray(d.recommended_tools) : diagramFallback.recommended_tools,
    search_queries: asArray(d.search_queries).length ? asArray(d.search_queries) : diagramFallback.search_queries,
  };
}

async function analyzePipeline(formData) {
  const inferred = inferPattern(formData);
  console.log(`  Pattern candidate: ${inferred.pattern}`);
  console.log(`  Signals: ${inferred.signals.join(", ") || "none"}`);

  const research = await researchAgent(formData, inferred).catch((err) => {
    console.warn("Research agent failed:", err.message);
    return [];
  });

  const architecture = await architectureAgent(formData, inferred, research);

  const [cost, diagram] = await Promise.all([
    costAgent(formData, architecture),
    diagramToolsAgent(formData, architecture, inferred),
  ]);

  const business = await businessAgent(formData, architecture, cost);

  return normalizeAnalysis({
    f: formData,
    inferred,
    architecture,
    cost,
    business,
    diagram,
    research,
  });
}

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

app.get("/", (_req, res) => {
  res.json({
    service: "Chanakya API",
    status: "ok",
    version: "2.0-single-file",
    openrouter: !!process.env.OPENROUTER_API_KEY,
    tavily: !!process.env.TAVILY_API_KEY,
    models: {
      analyze: MODEL_CHAINS.analyze,
      light: MODEL_CHAINS.light,
      research: MODEL_CHAINS.research,
    },
  });
});

app.post("/api/refine-query", async (req, res) => {
  const { problem, industry, dataTypes } = req.body;
  if (!problem) return res.status(400).json({ error: "No problem provided" });

  const fallback = {
    clarity_score: 6,
    improved_prompt: `${problem}\n\nIndustry: ${industry || "not specified"}. Data: ${(dataTypes || []).join(", ") || "not specified"}. The recommendation should identify the target users, data sources, decision points, success metrics, constraints, and expected business outcome.`,
    what_i_added: ["Industry/data context", "Implementation success criteria"],
    what_i_assumed: ["The user wants an actionable AI architecture recommendation"],
    missing_that_would_help: ["Current process", "Target users", "Data sensitivity", "Expected volume"],
    key_signals_detected: inferPattern({ problem, industry, dataTypes }).signals,
  };

  const result = await callJSONAgent({
    name: "refineQuery",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.light,
    system: "You improve vague AI use-case problem statements into precise architecture prompts.",
    user: `Return ONLY JSON: {"clarity_score":6,"improved_prompt":"...","what_i_added":["..."],"what_i_assumed":["..."],"missing_that_would_help":["..."],"key_signals_detected":["..."]}\n\nProblem: ${problem}\nIndustry: ${industry || "unknown"}\nData: ${(dataTypes || []).join(", ") || "unknown"}`,
    fallback,
  });
  res.json(result);
});

app.post("/api/summarize", async (req, res) => {
  const { analysis, formData } = req.body;
  if (!analysis) return res.status(400).json({ error: "No analysis provided" });

  const compact = {
    recommended_pattern: analysis.recommended_pattern,
    executive_summary: analysis.executive_summary,
    should_build_ai: analysis.should_build_ai,
    business_impact: analysis.business_impact,
    models: analysis.models,
    cost_model: analysis.cost_model,
    risks: analysis.risks,
    next_steps: analysis.next_steps,
  };

  const fallback = {
    executive: {
      headline: analysis.business_impact?.headline || analysis.executive_summary || "AI architecture recommendation ready for executive review.",
      situation: `The organization is evaluating ${analysis.recommended_pattern?.name || "an AI solution"}.`,
      recommendation: analysis.recommended_pattern?.one_liner || "Start with a focused pilot and measure outcomes before scaling.",
      bullets: ["Validate business value", "Control cost and risk", "Use staged rollout"],
      decision_needed: "Approve pilot scope and success metrics.",
    },
    engineering: {
      tldr: analysis.recommended_pattern?.rationale || "Build a small, observable AI workflow first.",
      stack: "Frontend + API + LLM router + observability",
      key_decisions: [analysis.architecture?.key_decision || "Choose the right orchestration pattern"],
      hardest_parts: ["Evaluation", "Data access", "Reliability"],
      sprint_1: "Build pilot workflow and baseline evals.",
      open_questions: ["What data is available?", "What success metric matters most?"],
    },
    board: {
      opportunity: analysis.business_impact?.headline || "Improve decision velocity with AI-assisted architecture workflows.",
      moat: analysis.differentiator || "Workflow-specific architecture intelligence.",
      risk_adjusted_view: "Proceed with a measured pilot and governance controls.",
      verdict: "build",
      verdict_reason: "The pilot can validate ROI without large upfront commitment.",
    },
  };

  const result = await callJSONAgent({
    name: "summarize",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.light,
    system: "Create stakeholder-specific summaries. Return executive, engineering, and board summaries as JSON.",
    user: `Industry: ${formData?.industry || "enterprise"}\nProblem: ${(formData?.problem || "").slice(0, 500)}\nAnalysis: ${safeJSON(compact, 5000)}`,
    fallback,
  });
  res.json(result);
});

app.post("/api/analyze", async (req, res) => {
  const { formData } = req.body;

  if (!formData?.problem || formData.problem.length < 10) {
    return res.status(400).json({ error: "A business problem description is required." });
  }

  try {
    console.log(`\n-> Analyzing: "${formData.problem.slice(0, 80)}..."`);
    console.log(`   Industry: ${formData.industry || "unknown"}`);

    const analysis = await analyzePipeline(formData);

    console.log(`   Pattern: ${analysis.recommended_pattern?.name}`);
    console.log(`   Tools: ${(analysis.recommended_tools || []).map((t) => t.name).join(", ")}`);

    let resources = [];
    const queries = asArray(analysis.search_queries).slice(0, 3);
    if (queries.length && process.env.TAVILY_API_KEY) {
      const results = await Promise.all(queries.map(callTavily));
      resources = results
        .flat()
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 8);
      console.log(`   Articles: ${resources.length} found from Tavily`);
    }

    res.json({ analysis, resources });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({
      error: err.message,
      type: err instanceof ProviderError ? "provider_error" : "server_error",
      providerStatus: err.status || undefined,
      model: err.model || undefined,
      retryAfter: err.retryAfter || undefined,
    });
  }
});

app.post("/api/optimize", async (req, res) => {
  const { formData, analysis, optimizationType } = req.body;
  if (!analysis || !optimizationType) return res.status(400).json({ error: "Missing analysis or optimizationType" });

  const goals = {
    cost: "Reduce cost by simplifying models, caching, reducing retrieval calls, and shortening outputs.",
    latency: "Reduce latency using parallel calls, smaller models, caching, and pre-computation.",
    accuracy: "Improve accuracy using evals, reranking, hybrid retrieval, better prompts, and stronger models for hard steps.",
  };

  const fallback = {
    optimized_analysis: analysis,
    changes: [`Reviewed architecture for ${optimizationType}`, "Prioritize eval-driven improvements", "Apply targeted model routing", "Add observability"],
    summary: `The architecture can be optimized for ${optimizationType} by changing model routing, caching, and evaluation strategy without changing the frontend contract.`,
    metrics_delta: { cost_change: "Depends on model routing", latency_change: "Depends on parallelization", accuracy_change: "Depends on eval and retrieval quality" },
  };

  const result = await callJSONAgent({
    name: "optimize",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.optimize,
    system: "You optimize an AI architecture analysis for a specified goal. Return JSON with optimized_analysis, changes, summary, metrics_delta.",
    user: `Optimization goal: ${goals[optimizationType] || optimizationType}\nProblem context: ${safeJSON(formData, 1500)}\nCurrent analysis: ${safeJSON(analysis, 7000)}`,
    fallback,
  });
  res.json(result);
});

app.post("/api/refine", async (req, res) => {
  const { formData, analysis, conversationHistory, newMessage } = req.body;
  if (!analysis || !newMessage) return res.status(400).json({ error: "Missing analysis or message" });

  const fallback = {
    reply: "I can refine this recommendation. Please specify whether you want to change cost, latency, accuracy, compliance posture, tools, or the architecture pattern.",
    updated_analysis: null,
    changes_summary: null,
  };

  const result = await callJSONAgent({
    name: "refine",
    models: MODEL_CHAINS.light,
    maxTokens: TOKENS.refine,
    system: `You are Chanakya, an AI architecture advisor in conversation with a client. Return ONLY JSON: {"reply":"1-4 sentence answer", "updated_analysis": null, "changes_summary": null}. Only populate updated_analysis when the user explicitly requests architectural changes.`,
    user: `Problem: ${formData?.problem || ""}\nIndustry: ${formData?.industry || ""}\nCurrent architecture: ${analysis?.recommended_pattern?.name || "unknown"}\nCurrent analysis: ${safeJSON(analysis, 7000)}\nConversation history: ${safeJSON(conversationHistory || [], 2000)}\nUser message: ${newMessage}`,
    fallback,
  });
  res.json(result);
});

// -----------------------------------------------------------------------------
// SERVER
// -----------------------------------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\nChanakya Backend v2\n  http://localhost:${PORT}\n  OpenRouter: ${process.env.OPENROUTER_API_KEY ? "connected" : "MISSING"}\n  Tavily: ${process.env.TAVILY_API_KEY ? "connected" : "not set"}\n  Analyze models: ${MODEL_CHAINS.analyze.join(" -> ")}\n`);
});
