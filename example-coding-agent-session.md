# Coding Agent Session: Designing Phase 14 -- Reference App, Competitive Analysis, and Architecture Planning

## Note

I maintain an AGENTS.md file with 12 non-negotiable engineering principles (latency budgets as contracts, atomic multi-index writes, bounded everything) and detailed phase blueprints for each build stage. The AI follows these constraints, and I direct architecture decisions, catch issues, and course-correct. The result: a solo developer shipping a 12-crate Rust engine with 700+ tests in 3 months, roughly one complete phase per week. The phase plan, guiding principles, and AGENTS.md are attached for context.

---

## Context

**Project:** HEBBS -- a memory engine for AI agents (12-crate Rust workspace, ~700 tests)
**Tool:** Cursor IDE with Claude as the coding assistant
**Session type:** Strategic product planning and architecture documentation

**What happened in this session:**
- I proposed adding a reference application phase to validate the full HEBBS stack end-to-end
- Directed competitive analysis of Mem0 (the leading competitor in AI agent memory)
- Identified the strongest use case for YC companies (AI Sales Intelligence Agent)
- The AI produced a formal architecture document, and I refined it through 12 turns:
  - Corrected scope (text-only, not voice)
  - Designed the observability display (collapsible panels showing HEBBS operations behind the scenes)
  - Added configurable embedding provider switching (ONNX vs OpenAI vs Ollama)
  - Changed default LLM from Ollama to OpenAI for immediate usability
  - Wrote a comprehensive README with embedding cost comparison tables
- 12+ documentation files updated with consistent cross-references across the phase plan

**Why this session matters:** It demonstrates how I use AI as a force multiplier within a rigorous engineering framework. HEBBS follows an AGENTS.md methodology -- 12 non-negotiable engineering principles, formal phase blueprints (scope boundaries, architectural decisions, risk register, done-when criteria), and dependency-ordered build phases. I set the constraints; the AI executes at speed within them. When the output drifts, I course-correct.

---

## Transcript

### Turn 1 -- Proposing the Reference App

**User:**
> I think after Phase 13 is developed - we should develop one app and test end to end use cases. Also figure out use various LLMs etc

**AI:** *(reads PhasePlan.md, examines existing LLM infrastructure in hebbs-reflect)*

Great idea. You've built 13 phases of infrastructure -- now you need a real app to validate it all end-to-end with actual LLM calls, real embeddings, and realistic usage patterns.

**Already built (LLM infrastructure in `hebbs-reflect`):**
- `LlmProvider` trait with `complete()` (blocking, `Send + Sync`)
- **Anthropic** (Claude Messages API), **OpenAI** (Chat Completions), **Ollama** (local), **Mock** providers
- All wired through `create_provider()` factory
- Currently only used for the reflect pipeline (proposal + validation stages)

**The gap:** LLMs are only exercised in the reflect pipeline. No real end-to-end app exists that exercises remember/recall/subscribe/reflect together with actual LLM-powered agents doing real work.

I'd propose adding a **Phase 14: Reference Application and LLM Integration Testing** (shifting current phases 14-18 to 15-19). Here's a sketch:

**App Concept:** A CLI-based AI assistant that:
1. **Remembers conversations** via `remember()` with structured context
2. **Recalls relevant context** via `recall(Similarity)` + `recall(Temporal)` before each response
3. **Subscribes in real-time** -- `subscribe()` surfaces related memories as conversation unfolds
4. **Learns over time** -- `reflect()` distills conversation patterns into insights
5. **Forgets on request** -- maps to `forget()`

Want me to write this up as a formal phase document and update the `PhasePlan.md`?

---

### Turn 2 -- Competitive Analysis and Use Case Selection

**User:**
> Scan https://docs.mem0.ai/cookbooks/overview to see some cookbooks. Think of a good use case which I can sell to even lot of YC companies

**AI:** *(fetches and analyzes Mem0's cookbook pages, identifies patterns)*

## What Mem0 Is Selling (and Where It Stops)

| Mem0 does | Mem0 doesn't do |
|-----------|-----------------|
| Store memories with `add()` | Learn patterns across memories |
| Similarity search with `search()` | Real-time memory surfacing during conversations |
| Metadata tagging + filtering | Graph-based causal/associative relationships |
| Auto-categorization via LLM | Multi-strategy recall (temporal, causal, analogical) |
| Memory expiration (TTL) | Biological decay + reinforcement |
| Cloud-hosted SaaS | Embedded mode (data stays local) |

Their cookbooks are essentially **"store a string, search for strings"** wrappers around Qdrant + OpenAI. There is no compound learning, no real-time streaming, no causal understanding.

## The Recommended Use Case: AI Sales Intelligence Agent

The largest cluster of funded YC companies right now is in AI-powered sales/customer-facing agents -- Leaping AI (voice AI, W25), Ergo (sales ops, W25), 11x, Artisan, and dozens more. Every one of them has the same problem: **their agents don't learn from past interactions at scale.**

**The pitch to a YC founder:**

> "Your AI sales agent handles 1,000 calls a month. After 6 months, it's no smarter than day one. HEBBS makes it get measurably better every week -- like a new hire who actually remembers everything and distills their own playbook."

| HEBBS Operation | Sales Use Case | Why Mem0 Can't Do This |
|----------------|---------------|----------------------|
| `remember()` | Store every call transcript + outcome with structured context | Similar (both store text) |
| `recall(Similarity)` | "Find calls where the prospect had a similar objection" | Mem0 does this |
| `recall(Temporal)` | "Show me the last 5 interactions with Acme Corp" | Mem0 has basic date filters, but no first-class temporal index |
| `recall(Causal)` | "What chain of events led to this deal closing?" | **Mem0 can't do this** |
| `recall(Analogical)` | "Find structurally similar deals" | **Mem0 can't do this** |
| `subscribe()` | **During a live call**, surface relevant memories as the conversation unfolds | **Mem0 can't do this** |
| `reflect()` | After 500 calls, auto-generate: "Enterprise deals in healthcare close 2x faster when you lead with compliance" | **Mem0 can't do this** |
| `prime()` | Before a call, load: recent history + relevant insights + similar deal patterns | **Mem0 can't do this** (would require multiple manual queries) |
| `decay` | Old objection-handling patterns naturally fade; frequently-accessed knowledge stays sharp | **Mem0 can't do this** |

**The subscribe capability during live calls is the killer feature.** No competitor in the memory layer space has real-time associative recall.

### Scenario Flow

```
Session 1: Sales call with Acme Corp
  → remember() stores transcript + context {company: "Acme", stage: "discovery", industry: "fintech"}

Session 2: Sales call with Beta Inc (similar profile)
  → prime() loads: "Acme had similar objections -- here's what worked"
  → subscribe() surfaces Acme insights in real-time as the call progresses

Session 3: 50 calls later, reflect() runs
  → Insight: "Fintech prospects convert 40% faster when demo focuses on compliance automation"
  → Insight linked to 12 source calls via InsightFrom edges

Session 4: New call with Gamma Corp (fintech)
  → recall(Analogical) finds structurally similar deals
  → The insight from Session 3 surfaces automatically
  → Agent is measurably smarter than Session 1
```

---

### Turn 3 -- Executing: Architecture Document + Cross-Reference Updates

**User:**
> Yes.

**AI:** *(creates formal phase document, updates PhasePlan.md, renumbers phases 14-18 to 15-19, updates dependency graph, updates cross-references in 12 files)*

**New file created:**
- `docs/phases/phase-14-reference-app-llm-integration.md` -- Full architecture blueprint (420+ lines) covering:
  - **Use case**: AI Sales Intelligence Agent (CLI-based Python app)
  - **7 scripted scenarios** validating every HEBBS operation and all 4 recall strategies
  - **LLM provider test harness** comparing providers across identical scenarios
  - **API ergonomics audit** to surface SDK friction points before docs go live
  - Risk register, scope boundaries, architectural decisions, done-when criteria

**Files updated:**
- `docs/PhasePlan.md` -- Phase 14 added, phases renumbered, dependency graph updated
- `docs/DocsSummary.md`, `docs/RepositoryStructure.md` -- Updated
- `docs/phases/phase-06` through `phase-13` -- Cross-references renumbered (8 files)

---

### Turn 4 -- Course Correction: Text, Not Voice

**User:**
> You proposed an app where we have to integrate audio? I think text conversations one will be easier to build, test, benchmark etc and more relevant to us. What you think?

**AI:**

You're right, and I agree -- the phase document I wrote is actually already text-only. There's no audio/voice integration in Phase 14. You might be thinking of the Mem0 voice companion cookbook I fetched earlier during research, but that was just for competitive analysis.

The reference app is a **text-based CLI** where:
- Interactive mode: you type messages as a sales prospect, the agent responds with text
- Scripted mode: pre-written text conversations run automatically with assertions

This is the right call for exactly the reasons you said -- text is deterministic, scriptable, testable, and benchmarkable.

---

### Turn 5 -- LLM Configuration Strategy

**User:**
> What LLM configuration will be done in demo app and what LLM configurations for Hebbs server. We want to use best models to show the quality as well of response, memory fetching, reflect as well in demos as amazing and wowness is critical in demos

**AI:**

There are two completely separate LLM integration points:

**1. HEBBS Engine (Rust side) -- `reflect()` pipeline only**
- Proposal stage: "Here's a cluster of 15 sales call memories. What patterns do you see?"
- Validation stage: "Here are 3 candidate insights. Are they supported by the source memories?"

**2. Demo App (Python side) -- conversation + memory extraction**
- Conversation generation: The sales agent's actual responses
- Memory extraction: Deciding what structured facts to `remember()` from each turn

For demos, I'd use **one model everywhere**: Claude Sonnet 4. Consistency matters -- you don't want one stage producing great output and another producing mediocre output that undermines the demo narrative.

The real demo wow moments come from HEBBS operations that no competitor can do:
1. **Reflect insight appearing in a new call** -- the compound learning moment
2. **Subscribe surfacing context mid-conversation** -- real-time associative memory
3. **Cross-session continuity via `prime()`** -- the "this isn't just RAG" moment
4. **Graph traversal** -- causal intelligence

---

### Turn 6 -- Identifying the Observability Gap

**User:**
> So we should keep showing clearly visibly whats happening behind the scenes in hebbs in frontend. Have we incorporated that?

**AI:**

Honestly, no -- this is a significant gap in the current phase doc. Without it, the demo is just "a chatbot that gives good answers" -- indistinguishable from good prompting. The whole point is showing **why** the agent is smart, not just **that** it's smart.

Here's what should be visible during a demo conversation:

```
┌─ HEBBS Activity ──────────────────────────────────────────────────┐
│                                                                    │
│  REMEMBER  "Acme Corp concerned about SOC 2 compliance"            │
│            importance: 0.8 | entity: acme_corp | topic: compliance  │
│                                                                    │
│  RECALL    strategy: Similarity + Temporal (multi-strategy)        │
│            5 memories retrieved (4.1ms):                            │
│              0.91  "Beta Inc had identical SOC 2 blockers"          │
│              0.87  "Gamma Corp resolved compliance via..."          │
│              0.83  "Fintech prospects prioritize compliance" [INSIGHT]│
│                                                                    │
│  SUBSCRIBE surfaced 1 memory (confidence: 0.84)                    │
│            "Beta Inc resolved SOC 2 by partnering with Vanta"      │
│                                                                    │
│  Total HEBBS latency: 7.3ms                                        │
└────────────────────────────────────────────────────────────────────┘

Agent: Based on what I've seen with similar fintech companies, SOC 2
       compliance is usually the top concern at this stage...
```

Without this panel, you're demoing a chatbot. With it, you're demoing a **memory engine**.

---

### Turn 7 -- Collapsible Panel Design

**User:**
> Perfect, with a +, - toggle that shows title always but descriptions can be hidden / shown. Update this in docs

**AI:** *(updates phase-14 doc with new Architectural Decision section)*

Added to the phase doc:
- **Collapsible panels** with always-visible title bars showing operation name, count, and latency
- **`+`/`-` toggle** -- collapsed = one-line summary, expanded = full details
- **Verbosity levels**: `--quiet` (CI), `--normal` (collapsed), `--verbose` (expanded)
- **Color coding**: insights in cyan, subscribe pushes in yellow, latency green/yellow/red by threshold
- 10 new Done When checkboxes for the observability display

---

### Turn 8 -- Embedding Trade-off Analysis

**User:**
> Is onnxembedder used for embedding? Is it better than openai embeddings?

**AI:**

| | BGE-small-en-v1.5 (HEBBS default) | OpenAI text-embedding-3-small | OpenAI text-embedding-3-large |
|--|---|---|---|
| **Dimensions** | 384 | 1536 | 3072 |
| **MTEB Benchmark** | ~62% avg | ~62% avg | ~64% avg |
| **Latency** | ~3ms local | ~100-300ms (network) | ~100-300ms (network) |
| **Cost** | Free (runs locally) | $0.02 / 1M tokens | $0.13 / 1M tokens |
| **Privacy** | Data never leaves device | Data sent to OpenAI | Data sent to OpenAI |
| **Offline** | Yes | No | No |

I'd recommend **keeping BGE-small as the default** because:
- It reinforces the "no cloud dependency" story
- The observability panel showing multi-strategy recall scores will demonstrate that HEBBS's intelligence comes from the memory architecture, not from the embedding model
- Upgrading to a better embedder later is a config change, not a code change

---

### Turns 9-10 -- Configurable Embedding Switching

**User:**
> yes ... add it in a way i can switch easily from configuration

**AI:** *(updates phase doc with embedding provider configuration)*

Added:
- New `[embedding]` config section with three providers: `onnx`, `openai`, `ollama`
- Pre-built config profiles: `local.toml`, `demo-quality.toml`, `cost-optimized.toml`
- New CLI command `compare-embeddings` for side-by-side reports
- Safety guard: validates database was created with same embedding provider on startup

---

### Turn 11 -- Practical Constraint: OpenAI Default

**User:**
> I have access to openai keys. Can you please use those for llm. Dont want to install ollama on machine for now.

**AI:** *(updates 6 files: config profiles, package structure, Done When criteria, risk register, test harness, PhasePlan.md)*

Done. The default is now **OpenAI everywhere** -- one environment variable (`OPENAI_API_KEY`) and the full demo runs with no local model installation. Ollama remains available in `configs/local.toml` for when you want offline/free operation.

---

### Turn 12 -- README and Embedding Documentation

**User:**
> Need to test onnx and openai to see comparison as well. Generate in README how to shift models, especially embeddings. embedding is super critical for cost and efficiency for retrieval.

**AI:** *(writes hebbs-demo/README.md, updates phase doc Done When)*

Created `hebbs-demo/README.md` covering:
- Embedding providers comparison table (dimensions, latency, cost, quality, offline support)
- Step-by-step switching instructions with exact TOML snippets
- Cost comparison: ONNX is 33x-330x cheaper than OpenAI for embeddings
- "When to use which" decision matrix for development, demos, production, and edge
- Pre-built config profiles with one-liner commands

---

## Session Summary

**In one session, the following was produced:**
- 1 new architecture blueprint document (420+ lines) with scope boundaries, 7 scenarios, risk register, and done-when criteria
- Competitive analysis of Mem0 with feature-by-feature differentiation table
- Observability display design with collapsible panels and verbosity levels
- Configurable embedding provider architecture (ONNX / OpenAI / Ollama)
- Comprehensive README with embedding cost analysis
- 12+ existing documentation files updated with consistent cross-references
- Phase plan renumbered (14-18 → 15-19) with dependency graph updated

**The founder's role:** Set the direction ("build a reference app"), directed competitive research ("scan Mem0"), made product decisions ("text not voice", "OpenAI not Ollama"), identified gaps ("show what's happening behind the scenes"), and refined the architecture through iterative feedback. The AI executed within the AGENTS.md engineering framework that governs every phase of HEBBS development.
