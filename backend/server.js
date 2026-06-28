import express  from "express";
import cors     from "cors";
import dotenv   from "dotenv";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "2mb" }));

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
// Lives here on the backend — never exposed to the client

const SYSTEM_PROMPT = `You are Chanakya, a senior AI solution architect and product consultant with deep expertise in LLM systems, RAG architectures, multi-agent systems, and Model Context Protocol (MCP).

Return ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

Return exactly this structure:
{
  "executive_summary": "2-3 actionable sentences for a CTO or VP Engineering",
  "recommended_pattern": {
    "name": "one of these patterns OR a combination when multiple genuinely apply (e.g. MCP Integration + Multi-Agent, RAG + Multi-Agent, Agentic RAG + MCP Integration): Simple LLM | RAG | Agentic RAG | Multi-Agent | MCP Integration | RAG + Multi-Agent | Recursive Language Model (RLM) | Custom Pipeline. Be accurate and specific — if the solution uses MCP servers AND multiple agents, say MCP Integration + Multi-Agent",
    "confidence": "High or Medium or Low",
    "one_liner": "one memorable sentence capturing the core architectural insight",
    "rationale": "3-4 sentences explaining why this pattern fits this specific problem, data, and constraints",
    "complexity": "Low or Medium or High",
    "time_to_first_value": "realistic estimate e.g. 2-3 weeks"
  },
  "architecture": {
    "components": [
      {
        "name": "component name",
        "role": "what it does in this solution",
        "recommended_tool": "specific tool or framework",
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
      "why": "specific reason for this problem requirements",
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
      "breakdown": "token and operation breakdown e.g. 600 input + 250 output + 2 retrieval ops"
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
      "mitigation": "concrete actionable mitigation"
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
  "compliance_notes": "compliance-specific architecture notes, or empty string",
  "differentiator": "what makes this architectural approach uniquely suited and hard to replicate",
  "orchestration_reasoning": {
    "problem_signals": ["signal 1 from the problem description", "signal 2", "signal 3"],
    "patterns_considered": [{ "pattern": "name", "rejected_because": "reason" }],
    "chosen_because": "2-3 sentence decisive explanation",
    "key_tradeoffs_accepted": ["tradeoff 1", "tradeoff 2"],
    "decision_chain": "step-by-step reasoning chain from problem signals to final choice"
  },
  "agent_llm_map": [
    {
      "agent": "agent name",
      "role_in_use_case": "specific description of what this agent does for THIS exact problem",
      "llm": "exact model name",
      "llm_rationale": "why this specific model for this agent role",
      "tools_used": ["tool1", "tool2"]
    }
  ],
  "rag_strategy": "ONLY populate when recommended_pattern.name contains RAG. Otherwise null. When RAG: { \"chunking_strategy\": \"e.g. recursive character splitting\", \"chunk_size\": 512, \"chunk_overlap\": 64, \"embedding_model\": \"exact model name e.g. text-embedding-3-small\", \"embedding_provider\": \"OpenAI\", \"embedding_cost_per_1m_tokens\": 0.02, \"similarity_metric\": \"cosine\", \"similarity_threshold\": 0.75, \"top_k\": 5, \"reranking\": true, \"reranker_tool\": \"Cohere Rerank or null\", \"estimated_cost_per_query_usd\": 0.0003, \"why_this_strategy\": \"2 sentences why this chunking/embedding fits this use case\" }",
  "business_impact": {
    "headline": "one sentence a CEO understands — outcome not technology",
    "what_changes_for_team": "specific description of how day-to-day work changes for the people involved",
    "who_benefits": [{ "role": "job title", "how": "specific way their work improves" }],
    "use_case_walkthrough": "narrative paragraph walking through one real scenario end-to-end using the recommended architecture — written for a business reader, no jargon",
    "what_ai_decides": "what decisions the AI makes autonomously",
    "what_human_decides": "what decisions stay with humans and why",
    "success_metrics": ["metric 1", "metric 2", "metric 3"]
  },
  "should_build_ai": "null if no legacy data provided. Otherwise: { \"verdict\": \"Strong Yes | Yes with caveats | Proceed carefully | Not yet | No\", \"confidence\": \"High | Medium | Low\", \"reasoning\": \"2-3 sentences\", \"roi_analysis\": { \"current_annual_cost_usd\": 0, \"projected_ai_annual_cost_usd\": 0, \"annual_saving_usd\": 0, \"payback_period_months\": 0, \"three_year_roi_percent\": 0, \"assumptions\": \"key assumptions\" }, \"comparison\": { \"time\": { \"before\": \"e.g. 5 days\", \"after\": \"e.g. 2 hours\", \"improvement\": \"95% reduction\" }, \"cost_per_transaction\": { \"before\": \"$850\", \"after\": \"$0.08\", \"improvement\": \"99.9% reduction\" }, \"accuracy\": { \"before\": \"87%\", \"after\": \"94%\", \"improvement\": \"+7pp\" }, \"headcount\": { \"before\": \"6 FTE\", \"after\": \"1 oversight\", \"improvement\": \"83% reduction\" } }, \"break_even_point\": \"e.g. 8 weeks at current volume\", \"risks_to_roi\": [\"risk 1\", \"risk 2\"] }",
  "swimlane_diagram": "a Mermaid diagram using graph LR with subgraphs as swimlanes representing logical layers. Use this format: graph LR with subgraph Input, subgraph Orchestration, subgraph DataSources, subgraph Processing, subgraph Output. Keep node labels very short (max 3 words). This should be simpler and more readable than the full flowchart.",
  "research_backing": [{"claim":"research-backed claim","paper_title":"exact title","authors_year":"Author et al., 2024","citation":"APA citation","key_finding":"specific metric or result","source_url":"https://arxiv.org/...","quote":"2-sentence key quote","relevance":"how this applies","supports_or_challenges":"supports|challenges|nuances"}],
  "mermaid_diagram": "a valid flowchart TD mermaid diagram of the full orchestration. Include agents, tools, databases [(DB Name)], external services([Service Name]), decisions{Decision?}, steps[Step Name] connected by labeled arrows. Show full flow from input to output. Keep node labels under 25 chars.",
  "recommended_tools": [
    {
      "name": "tool name e.g. TurboPuffer or LangGraph or Langfuse",
      "category": "Vector DB or Orchestration or Observability or Caching or Embedding or Document Processing or Reranking",
      "why": "specific reason this tool helps this architecture and problem",
      "url": "https://official-website.com",
      "cost_impact": "how it affects cost e.g. reduces vector storage cost 70% vs Pinecone",
      "open_source": true
    }
  ],
  "search_queries": [
    "specific Tavily search query 1 — must be relevant to the exact architecture pattern and industry",
    "specific Tavily search query 2 — focus on implementation tutorials or case studies",
    "specific Tavily search query 3 — focus on tools, cost optimization, or best practices"
  ]
}

For recommended_tools: always include 4-6 tools. Prioritize lesser-known but powerful tools the client may not know about:
- TurboPuffer (serverless vector DB, massive cost savings vs Pinecone)
- Langfuse (open-source LLM observability)
- Qdrant (open-source vector DB, great performance)
- LlamaParse (superior PDF parsing vs naive chunking)
- Cohere Rerank / Jina Reranker (improve RAG precision dramatically)
- LangGraph (stateful multi-agent orchestration)
- Helicone (LLM cost tracking + caching)
- Temporal (durable execution for long-running agents)
- CrewAI (team-based multi-agent framework)
- Unstructured.io (enterprise document processing)
Match tools to what the architecture actually needs.`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const extractJSON = (text) => {
  let s = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try { return JSON.parse(s); } catch (_) {}

  const start = s.indexOf("{");
  const end   = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(s.slice(start, end + 1)); } catch (_) {}
  }
  throw new Error("Could not parse JSON from model response — try again.");
};

const callOpenRouter = async (messages) => {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer":  "http://localhost:5173",
      "X-Title":       "Chanakya - AI Strategy & Architecture Advisor",
    },
    body: JSON.stringify({
      model:      "anthropic/claude-sonnet-4-5",
      max_tokens: 16000,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${errText}`);
  }
  return res.json();
};

const callTavily = async (query) => {
  if (!process.env.TAVILY_API_KEY) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key:             process.env.TAVILY_API_KEY,
        query,
        search_depth:        "basic",
        max_results:         3,
        include_answer:      false,
        include_raw_content: false,
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(r => ({
      title:   r.title   || "Untitled",
      url:     r.url     || "",
      snippet: (r.content || "").slice(0, 220).trim() + "…",
      score:   r.score   || 0,
      query,
    }));
  } catch (e) {
    console.warn(`Tavily query failed: "${query}" —`, e.message);
    return [];
  }
};

const buildUserMessage = (f, researchClaims) => `
Analyze this business problem and provide a complete architecture recommendation:

Business Problem:
${f.problem}

Context:
- Industry:    ${f.industry}
- Data Sources: ${(f.dataTypes  || []).join(", ") || "Not specified"}
- Latency:      ${f.latency}
- Volume:       ${f.volume}
- Accuracy:     ${f.accuracyStakes}
- Budget:       ${f.budget}
- Compliance:   ${(f.compliance || []).join(", ") || "None"}
- Existing Stack: ${f.existingStack || "Not specified"}

Be specific to this domain and constraints.

${researchClaims?.length ? "RESEARCH EVIDENCE (cite in research_backing):\n" + researchClaims.map((r,i) => "[" + (i+1) + "] " + r.paper_title + " (" + r.authors_year + "): " + r.key_finding).join("\n") : ""} Use real 2025/2026 model names and current pricing.

${(f.techConstraints || f.teamConstraints || f.timeline || f.implBudget) ? (
  "\nCOMPANY CONSTRAINTS (critical — architecture must respect these):\n" +
  (f.techConstraints ? "Technical: " + f.techConstraints + "\n" : "") +
  (f.teamConstraints ? "Team: " + f.teamConstraints + "\n" : "") +
  (f.timeline ? "Timeline: " + f.timeline + "\n" : "") +
  (f.implBudget ? "Implementation budget: $" + f.implBudget + "\n" : "") +
  (f.specificRegs ? "Regulations: " + f.specificRegs + "\n" : "") +
  "Flag any conflicts between these constraints and the recommended architecture in the risks section."
) : ""}

${(f.currentProcess || f.currentMonthlyCost || f.currentTimePerTask) ? (
  "\nCurrent Legacy State:\n" +
  (f.currentProcess ? "Process: " + f.currentProcess + "\n" : "") +
  (f.currentMonthlyCost ? "Monthly cost: $" + f.currentMonthlyCost + "\n" : "") +
  (f.currentTimePerTask ? "Time per task: " + f.currentTimePerTask + " " + (f.currentTimeUnit || "hours") + "\n" : "") +
  (f.currentTeamSize ? "Team: " + f.currentTeamSize + " people\n" : "") +
  (f.currentAccuracy ? "Current accuracy: " + f.currentAccuracy + "%\n" : "") +
  "Populate should_build_ai with full ROI analysis and build verdict."
) : "No legacy data — set should_build_ai to null."}
Include 4-6 tool recommendations and 3 Tavily search queries relevant to this exact problem.
`.trim();

// ─── ROUTES ──────────────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    service: "Chanakya API",
    status:  "ok",
    openrouter: !!process.env.OPENROUTER_API_KEY,
    tavily:     !!process.env.TAVILY_API_KEY,
  });
});


// ─── AGENTIC RAG RESEARCH AGENT ─────────────────────────────────────────────

const RESEARCH_TOOLS = [
  { type: "function", function: { name: "search_papers", description: "Search Semantic Scholar for academic papers on AI architecture patterns, ML systems, or domain-specific AI applications.", parameters: { type: "object", properties: { query: { type: "string" }, limit: { type: "integer", default: 5 }, year_from: { type: "integer" } }, required: ["query"] } } },
  { type: "function", function: { name: "fetch_paper", description: "Fetch full details of a specific paper by arXiv ID.", parameters: { type: "object", properties: { paper_id: { type: "string" } }, required: ["paper_id"] } } },
];

async function executeTool(name, args) {
  try {
    if (name === "search_papers") {
      const q   = encodeURIComponent(args.query);
      const lim = Math.min(args.limit || 5, 8);
      const yr  = args.year_from ? `&year=${args.year_from}-` : "";
      const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${q}&limit=${lim}${yr}&fields=paperId,title,abstract,authors,year,citationCount,externalIds,venue`;
      const res = await fetch(url, { headers: { "User-Agent": "Chanakya/1.0" } });
      const d   = await res.json();
      return (d.data || []).map(p => ({ id: p.paperId, title: p.title, abstract: (p.abstract||"").slice(0,500), authors: (p.authors||[]).slice(0,3).map(a=>a.name).join(", "), year: p.year, citations: p.citationCount, arxiv_id: p.externalIds?.ArXiv, url: p.externalIds?.ArXiv ? `https://arxiv.org/abs/${p.externalIds.ArXiv}` : `https://semanticscholar.org/paper/${p.paperId}` }));
    }
    if (name === "fetch_paper") {
      const url = `https://export.arxiv.org/api/query?id_list=${args.paper_id}`;
      const res = await fetch(url);
      const xml = await res.text();
      const title    = xml.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() || "";
      const abstract = xml.match(/<summary>(.*?)<\/summary>/s)?.[1]?.trim() || "";
      const authors  = [...xml.matchAll(/<name>(.*?)<\/name>/g)].map(m=>m[1]).slice(0,4).join(", ");
      return { id: args.paper_id, title, abstract, authors, url: `https://arxiv.org/abs/${args.paper_id}` };
    }
  } catch (e) { return { error: e.message }; }
}

async function runResearchAgent(problem, pattern, industry) {
  console.log("  🔬 Research agent starting...");
  const messages = [
    { role: "system", content: `You are a research agent. Find 4-6 peer-reviewed papers supporting or challenging the "${pattern}" architecture pattern for: ${problem.slice(0,200)}. Industry: ${industry||"enterprise"}. Use tools to search. Only cite papers you actually retrieve. When done, stop calling tools.` },
    { role: "user", content: `Find research evidence for "${pattern}" architecture. Search now.` }
  ];

  const collectedPapers = [];
  for (let i = 0; i < 4; i++) {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "HTTP-Referer": "https://chanakya.ai" },
      body: JSON.stringify({ model: "anthropic/claude-3-5-haiku", max_tokens: 1500, tools: RESEARCH_TOOLS, tool_choice: i < 3 ? "auto" : "none", messages }),
    });
    const data    = await res.json();
    const message = data.choices?.[0]?.message;
    if (!message) break;
    messages.push(message);
    if (!message.tool_calls?.length) break;

    const results = await Promise.all(message.tool_calls.map(async tc => {
      const args   = JSON.parse(tc.function.arguments);
      const result = await executeTool(tc.function.name, args);
      if (Array.isArray(result)) result.forEach(p => { if (p.title && !collectedPapers.find(x=>x.title===p.title)) collectedPapers.push(p); });
      return { role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) };
    }));
    messages.push(...results);
    console.log(`  ↺ Research iter ${i+1}: ${collectedPapers.length} papers`);
  }

  if (!collectedPapers.length) return null;

  const synthRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` },
    body: JSON.stringify({ model: "anthropic/claude-3-5-haiku", max_tokens: 2000, messages: [{
      role: "user",
      content: "Generate research claims for \"" + pattern + "\" from these papers:\n" +
        collectedPapers.map(p => "- \"" + p.title + "\" (" + p.authors + ", " + p.year + ") [" + p.url + "]\n  " + (p.abstract||"").slice(0,300)).join("\n\n") +
        "\n\nReturn ONLY JSON array: [{\"claim\":\"...\",\"paper_title\":\"...\",\"authors_year\":\"Author et al., Year\",\"citation\":\"APA citation\",\"key_finding\":\"specific metric/result\",\"source_url\":\"url\",\"quote\":\"2 sentence key quote\",\"relevance\":\"how it applies\",\"supports_or_challenges\":\"supports|challenges|nuances\"}]"
    }] }),
  });
  const synthData = await synthRes.json();
  const raw = synthData.choices?.[0]?.message?.content || "";
  try {
    const claims = JSON.parse(raw.replace(/```json|```/g,"").trim());
    console.log(`  ✓ Research: ${claims.length} claims from ${collectedPapers.length} papers`);
    return claims;
  } catch (e) {
    return collectedPapers.slice(0,4).map(p => ({ claim: p.title, paper_title: p.title, authors_year: (p.authors||"").split(",")[0]+" et al., "+p.year, citation: `${p.authors} (${p.year}). ${p.title}.`, key_finding: (p.abstract||"").slice(0,150), source_url: p.url, quote: (p.abstract||"").slice(0,250), relevance: "Relevant to "+pattern+" architecture", supports_or_challenges: "supports" }));
  }
}

// ─── /api/refine-query ────────────────────────────────────────────────────────

app.post("/api/refine-query", async (req, res) => {
  const { problem, industry, dataTypes } = req.body;
  if (!problem) return res.status(400).json({ error: "No problem provided" });
  const messages = [
    { role: "system", content: `You are an AI solutions consultant. Improve vague problem statements into precise ones for better AI architecture recommendations. Return ONLY valid JSON: {"clarity_score":6,"improved_prompt":"rewritten 3-6 sentence problem statement keeping user voice but adding precision","what_i_added":["thing added"],"what_i_assumed":["assumption"],"missing_that_would_help":["missing info"],"key_signals_detected":["signal"]}` },
    { role: "user", content: `Problem: ${problem}
Industry: ${industry||"unknown"}
Data: ${(dataTypes||[]).join(", ")||"unknown"}

Refine this.` }
  ];
  try {
    const orRes  = await callOpenRouter(messages, 1200);
    const raw    = orRes.choices?.[0]?.message?.content || "";
    const result = JSON.parse(raw.replace(/```json|```/g,"").trim());
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── /api/summarize ───────────────────────────────────────────────────────────

app.post("/api/summarize", async (req, res) => {
  const { analysis, formData } = req.body;
  if (!analysis) return res.status(400).json({ error: "No analysis provided" });
  const a = { recommended_pattern: analysis.recommended_pattern, executive_summary: analysis.executive_summary, should_build_ai: analysis.should_build_ai, business_impact: analysis.business_impact, models: analysis.models, cost_model: analysis.cost_model, risks: analysis.risks, next_steps: analysis.next_steps };
  const messages = [
    { role: "system", content: `Create stakeholder-specific summaries. Return ONLY valid JSON: {"executive":{"headline":"CEO-level outcome sentence","situation":"1-2 sentences","recommendation":"1-2 sentences","bullets":["quantified outcome","timeline + investment","key risk managed"],"decision_needed":"what + when"},"engineering":{"tldr":"2-sentence technical summary","stack":"core tech stack","key_decisions":["decision + tradeoff"],"hardest_parts":["challenge"],"sprint_1":"what to build first","open_questions":["question"]},"board":{"opportunity":"market opportunity","moat":"competitive advantage","risk_adjusted_view":"honest upside vs downside","verdict":"build|buy|wait|partner","verdict_reason":"one sentence"}}` },
    { role: "user", content: `Industry: ${formData?.industry||"enterprise"}
Problem: ${(formData?.problem||"").slice(0,300)}
Analysis: ${JSON.stringify(a).slice(0,3500)}` }
  ];
  try {
    const orRes  = await callOpenRouter(messages, 1800);
    const raw    = orRes.choices?.[0]?.message?.content || "";
    const result = JSON.parse(raw.replace(/```json|```/g,"").trim());
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/analyze", async (req, res) => {
  const { formData } = req.body;

  if (!formData?.problem || formData.problem.length < 10) {
    return res.status(400).json({ error: "A business problem description is required." });
  }

  try {
    console.log(`\n→ Analyzing: "${formData.problem.slice(0, 60)}..."`);
    console.log(`  Industry: ${formData.industry} | Pattern to find: ?`);

    // ── 1. Run research agent + call OpenRouter in parallel ───────────────
    const researchData   = await runResearchAgent(formData.problem, (formData.dataTypes||[]).includes("Documents & PDFs") ? "RAG" : "Multi-Agent", formData.industry).catch(() => null);
    const researchClaims = researchData;

    const orRes = await callOpenRouter([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildUserMessage(formData, researchClaims) },
    ]);


    const rawText  = orRes.choices?.[0]?.message?.content || "";
    const analysis = extractJSON(rawText);

    console.log(`  ✓ Pattern: ${analysis.recommended_pattern?.name}`);
    console.log(`  ✓ Tools:   ${(analysis.recommended_tools || []).map(t => t.name).join(", ")}`);
    console.log(`  ✓ Queries: ${(analysis.search_queries   || []).join(" | ")}`);

    // ── 2. Call Tavily in parallel for all search queries ─────────────────
    let resources = [];
    const queries = analysis.search_queries || [];

    if (queries.length > 0 && process.env.TAVILY_API_KEY) {
      const results = await Promise.all(queries.slice(0, 3).map(callTavily));
      resources = results
        .flat()
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 8);
      console.log(`  ✓ Articles: ${resources.length} found from Tavily`);
    } else if (!process.env.TAVILY_API_KEY) {
      console.log("  ⚠ Tavily key not set — skipping article search");
    }

    // ── 3. Return combined response ────────────────────────────────────────
    res.json({ analysis, resources });

  } catch (err) {
    console.error("  ✗ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ─── OPTIMIZE ENDPOINT ────────────────────────────────────────────────────────

app.post("/api/optimize", async (req, res) => {
  const { formData, analysis, optimizationType } = req.body;
  if (!analysis || !optimizationType) return res.status(400).json({ error: "Missing analysis or optimizationType" });

  const goals = {
    cost:     "Reduce costs by 50%+. Swap to cheaper models (Claude Haiku, DeepSeek, GPT-4o-mini), add semantic caching, prompt compression, batch processing. Show exact model swaps and savings.",
    latency:  "Reduce latency by 50%+. Use streaming, parallel retrieval calls, smaller routing model for classification, pre-computed embeddings, response caching. Show specific changes.",
    accuracy: "Maximize accuracy. Add reranking (Cohere Rerank or Jina), hybrid search (BM25 + vector), larger models for complex reasoning, chain-of-thought, eval-driven prompt tuning. Show specific changes.",
  };

  const sysPrompt = `You are Chanakya, an AI architecture optimizer. Optimize the given architecture for a specific goal.
Return ONLY valid JSON — no markdown, no backticks:
{
  "optimized_analysis": { /* same full structure as original analysis, with changes applied */ },
  "changes": ["specific change 1", "specific change 2", "specific change 3", "specific change 4"],
  "summary": "2-3 sentence explanation of what changed and expected impact",
  "metrics_delta": {
    "cost_change": "e.g. -55% per request",
    "latency_change": "e.g. no change or -40%",
    "accuracy_change": "e.g. no change or +15%"
  }
}`;

  const userMsg = `Current architecture:
${JSON.stringify(analysis, null, 2)}

Problem context:
Industry: ${formData?.industry}  Volume: ${formData?.volume}  Budget: ${formData?.budget}

Optimization goal: ${goals[optimizationType]}`;

  try {
    const orRes = await callOpenRouter([
      { role: "system", content: sysPrompt },
      { role: "user",   content: userMsg },
    ]);
    const raw = orRes.choices?.[0]?.message?.content || "";
    let result;
    try { result = extractJSON(raw); }
    catch (_) { result = { reply: raw.trim(), updated_analysis: null, changes_summary: null }; }
    const updated = result.updated_analysis ? "architecture updated" : "Q&A only";
    console.log(`  ✓ Refine (${updated}): "${newMessage.slice(0, 40)}..."`);
    res.json(result);
  } catch (err) {
    console.error("  ✗ Refine error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// ─── REFINE ENDPOINT ──────────────────────────────────────────────────────────

app.post("/api/refine", async (req, res) => {
  const { formData, analysis, conversationHistory, newMessage } = req.body;
  if (!analysis || !newMessage) return res.status(400).json({ error: "Missing analysis or message" });

  const sysPrompt = `You are Chanakya, an AI architecture advisor in conversation with a client about their architecture.
Return ONLY valid JSON:
{
  "reply": "conversational response (1-4 sentences, precise and helpful)",
  "updated_analysis": null,
  "changes_summary": null
}
If user requests architectural changes, also populate updated_analysis with the full updated analysis object and changes_summary array.
Only update analysis when user explicitly requests architectural changes.`;

  const messages = [
    { role: "system", content: sysPrompt },
    { role: "user", content: `Problem: ${formData?.problem}\nIndustry: ${formData?.industry}\n\nCurrent architecture: ${analysis?.recommended_pattern?.name}\n${JSON.stringify(analysis, null, 2)}` },
    { role: "assistant", content: `I've analyzed your problem and recommended ${analysis?.recommended_pattern?.name}. ${analysis?.recommended_pattern?.one_liner || ""} How can I help you refine this?` },
    ...(conversationHistory || []),
    { role: "user", content: newMessage },
  ];

  try {
    const orRes = await callOpenRouter(messages);
    const raw = orRes.choices?.[0]?.message?.content || "";
    let result;
    try { result = extractJSON(raw); }
    catch (_) { result = { reply: raw.trim(), updated_analysis: null, changes_summary: null }; }
    const updated = result.updated_analysis ? "architecture updated" : "Q&A";
    console.log(`  ✓ Refine (${updated}): "${newMessage.slice(0, 40)}..."`);
    res.json(result);
  } catch (err) {
    console.error("  ✗ Refine error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── START ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
🔱 Chanakya Backend
   http://localhost:${PORT}

   OpenRouter: ${process.env.OPENROUTER_API_KEY ? "✓ connected" : "✗ MISSING — set OPENROUTER_API_KEY in .env"}
   Tavily:     ${process.env.TAVILY_API_KEY     ? "✓ connected" : "⚠ not set  — article search disabled"}
  `);
});
