# HEBBS Website — Narrative Rethink Plan

**Date:** 2026-03-12
**Status:** Draft
**Problem:** The current hebbs-website leads with latency. But latency is a second-order concern — nobody chooses infrastructure because it's fast if it doesn't do what they need. The real story is capability, and the real unlock is that this capability is available to any agent, out of the box, today.

---

## The Core Insight

Before HEBBS, there was no such thing as "agent memory infrastructure." There were:
- Vector databases (similarity search)
- Memory search engines (keyword + embedding)
- KV stores (session state)
- Graph databases (relationships)

But none of them gave an agent **configurable cognitive memory** — temporal recall, causal reasoning, analogical transfer, decay, consolidation, revision — as a single consumable primitive. You had to stitch 4 services together, write 2,000 lines of glue, and still only get similarity search.

HEBBS is the first system that gives agents real memory. And with the skill system, it's available to Claude Code and OpenClaw agents **without a single extra command or configuration beyond install.**

---

## What Changes

### Current Narrative (Latency-First)

```
Hero:     "Sub-10ms recall at 10M memories"
Proof:    Benchmark tables (nanoseconds, milliseconds)
Story:    "We're faster than stitching 4 services together"
CTA:      Speed + simplicity
```

### New Narrative (Capability-First)

```
Hero:     "The first memory engine that actually thinks"
Proof:    What agents can DO that they couldn't before
Story:    "Nothing like this existed. Now it does. And it works out of the box."
CTA:      Capability + zero-friction adoption
```

---

## New Page Structure

### Section 1: Hero

**Headline:** The memory engine for AI agents.

**Subheadline:** Four recall strategies. Native consolidation. Automatic decay. One binary. Works with Claude and OpenClaw out of the box.

**Kill:** The nanosecond stat strip. Replace with a capability strip:

```
4 recall strategies · Native consolidation · Automatic decay · One skill file, zero config
```

**Buttons:** `[Install the skill]` `[GitHub]`

The first button drives to the one-command install — not a waitlist, not docs. The action is: your agent gets memory *now*.

---

### Section 2: The Weight Class (reframed)

**Current:** "Redis for caching. Kafka for streaming. HEBBS for agent memory."

**Keep this.** It works. But add a second line underneath:

> Every agent framework gives you similarity search and calls it memory. HEBBS gives your agent temporal reasoning, causal chains, analogical transfer, consolidation, and decay — the cognitive operations that turn retrieval into understanding.

---

### Section 3: The Problem (reframed from latency to capability)

**Current framing:** 4 services vs 1 binary, 50-200ms vs <10ms

**New framing:** What agents can't do today vs what HEBBS enables

```
Left column: "What your agent's memory actually does"

- Embed a question
- Find the 5 nearest vectors
- Return them and hope for the best
- Precision on temporal queries: 23%
- Precision on causal queries: 15%

Right column: "What HEBBS does"

- "What happened before this?" → Temporal recall (91% precision)
- "What caused this outcome?" → Causal graph walk (78% precision)
- "What pattern transfers here?" → Analogical matching (74% precision)
- "What looks like this?" → Similarity search (baseline)
- Memories decay. Important ones strengthen. Episodes consolidate into insights.
```

The delta isn't milliseconds. It's **+68 percentage points on temporal queries** and **+63 on causal**. That's the headline.

---

### Section 4: NEW — "Out of the Box" (the skill story)

This is the section that doesn't exist today and should be the second-biggest moment on the page.

**Headline:** One install. Your agent remembers.

**Story:** HEBBS ships as a skill for Claude Code and OpenClaw. No SDK integration. No glue code. No configuration. Install HEBBS, drop the skill file, and your agent automatically:

- Stores memories with importance weighting
- Recalls using the right strategy for the question
- Consolidates episodes into insights
- Forgets what's no longer relevant
- Primes context at conversation start

**Visual:** Side-by-side showing:

```
Without HEBBS:                          With HEBBS:

1. Choose a vector DB                   brew install hebbs-ai/tap/hebbs
2. Set up embedding pipeline
3. Write storage layer                  Done.
4. Write retrieval layer
5. Add temporal logic                   Your agent now has:
6. Add graph traversal                  ✓ 4 recall strategies
7. Wire it all together                 ✓ Temporal + causal + analogical
8. Handle decay manually                ✓ Native decay & reinforcement
9. Build consolidation pipeline         ✓ Automatic consolidation
10. Maintain 4 services                 ✓ Works with Claude & OpenClaw

~2,000 lines of glue                    0 lines of glue
```

**Supported agents strip:**

```
Claude Code · OpenClaw · Any agent that reads SKILL.md
```

---

### Section 5: The Nine Operations

**Keep the current Operations section** but reframe the intro.

**Current intro:** (implied) "Here's what HEBBS can do"

**New intro:** "Nine operations. That's the entire API. Each one is a cognitive primitive that didn't exist as a single call before."

Group them as today (Write / Read / Consolidate), but add one-line "why this matters" annotations:

| Operation | What it does | Why it matters |
|-----------|-------------|----------------|
| `remember()` | Store with importance scoring | Not append-only. Every memory is weighted at birth. |
| `revise()` | Update beliefs, keep lineage | Your agent corrects itself. No contradictory facts coexisting. |
| `forget()` | Prune by staleness, compliance | Real deletion. GDPR-proof. Signal-to-noise improves over time. |
| `recall()` | 4 strategies, composite scoring | The core innovation. Not just "find similar" — find relevant, recent, causal, analogical. |
| `prime()` | Pre-load context | Start of conversation = agent already knows what matters. |
| `subscribe()` | Real-time push | Memories surface automatically when they become relevant. |
| `reflect()` | Consolidate episodes → insights | Your agent learns patterns, not just stores facts. |
| `insights()` | Query consolidated knowledge | Higher-order understanding, not raw retrieval. |

---

### Section 6: Four Recall Strategies (reframed as the core differentiator)

**This section should be the centerpiece of the page.** Currently it exists but is buried under benchmarks.

**Headline:** Four ways to remember. Everyone else has one.

For each strategy, show:
1. The question it answers
2. A concrete agent scenario
3. The precision gap vs similarity-only

```
TEMPORAL — "What happened, in order?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent scenario: "Walk me through what happened with the Acme deal"
HEBBS: Walks the temporal index → returns events in sequence → 91% precision
Similarity-only: Embeds the question → returns 5 nearest chunks → 23% precision

CAUSAL — "What caused this outcome?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent scenario: "Why did the deployment fail on Friday?"
HEBBS: Walks the causal graph backward from failure → surfaces root cause chain → 78% precision
Similarity-only: Returns chunks mentioning "deployment" and "fail" → 15% precision

ANALOGICAL — "What's structurally similar in another domain?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent scenario: "We had a similar problem with onboarding — what did we learn?"
HEBBS: Finds structurally similar patterns across domains → transfers insights → 74% precision
Similarity-only: Returns chunks with overlapping keywords → 31% precision

SIMILARITY — "What looks like this?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The baseline everyone has. HEBBS has it too — plus configurable scoring weights
that blend relevance, recency, importance, and reinforcement.
```

---

### Section 7: Scoring Weights (keep, but reposition)

**Current:** Standalone section about tunable weights

**New position:** Nested under recall strategies as "One parameter changes everything"

This shows configurability — the agent tunes its own memory behavior:
- `1:0:0:0` = pure semantic (RAG mode)
- `0.2:0.8:0:0` = favor recent (live context mode)
- `0.3:0.1:0.5:0.1` = favor important (critical decisions mode)
- `0.1:0.1:0.1:0.7` = favor reinforced (pattern detection mode)

---

### Section 8: Consolidation (elevate)

**Currently:** Mentioned in operations, not given its own moment

**New:** Standalone section with a clear headline

**Headline:** Your agent doesn't just store. It learns.

**Story:** The `reflect` pipeline clusters raw memories, proposes insights, validates them, and stores consolidated knowledge with full lineage. This is the difference between a filing cabinet and a brain.

```
Raw memories (episodes):
  "Customer asked about pricing"
  "Customer mentioned competitor X"
  "Customer objected to annual commitment"
  "Deal lost to competitor X"

          ↓ reflect (automatic consolidation)

Insight (with lineage):
  "Deals mentioning competitor X with pricing objections
   have 73% loss rate when annual commitment is pushed early"
   [confidence: 0.84, sources: 4 memories, tags: sales, pricing]
```

---

### Section 9: Benchmarks (demoted, not removed)

**Current position:** Near the top, hero-adjacent

**New position:** Below the capability sections. Accessible but not leading.

**New framing:** "And it does all of this in under 10ms."

The benchmarks become the supporting evidence, not the headline. The reader already knows *what* HEBBS does (cognitive memory) and *how easy* it is (one install). Now they learn it's also absurdly fast:

- Keep the systems benchmark table (p50/p99 at 10M)
- Keep the scalability table
- Move the nanosecond storage-primitive numbers to a collapsible "deep dive" or separate page
- Remove the nanosecond numbers from the hero entirely

---

### Section 10: Architecture (keep, reposition)

Move below benchmarks. Engineers who've read this far want to know *how*. Give them:
- Single binary diagram
- Three deployment modes (standalone, embedded, edge)
- RocksDB + ONNX + custom indexes

---

### Section 11: Comparison Table (reframe)

**Current:** Latency-centric comparison

**New:** Capability-centric comparison with latency as one row, not the headline

| | pgvector | Qdrant | Neo4j | Memory Wrappers | **HEBBS** |
|---|---|---|---|---|---|
| Recall strategies | 1 | 1 | 1-2 | 1-2 | **4** |
| Temporal recall | No | No | No | No | **Native** |
| Causal reasoning | No | No | Partial | No | **Native** |
| Analogical transfer | No | No | No | No | **Native** |
| Native decay | No | No | No | No | **Yes** |
| Consolidation | No | No | No | Partial | **Native** |
| Revision with lineage | No | No | No | No | **Yes** |
| Agent skill (drop-in) | No | No | No | No | **Yes** |
| LLM calls on hot path | N/A | N/A | N/A | Yes | **Zero** |
| Recall latency (10M) | ~20ms | ~10ms | ~50ms | 50-200ms | **<10ms** |
| Runtime dependencies | Postgres | Qdrant | JVM + Neo4j | 3-4 services | **None** |

Latency is the last row, not the first. The story is: HEBBS does things nobody else does. And *also* it's faster.

---

### Section 12: CTA (reframe)

**Current:** "Algorithms, not LLM wrappers" + waitlist

**New:**

**Headline:** Give your agent a memory.

**Subtext:** One install. Works with Claude Code and OpenClaw. No configuration. No glue code.

```bash
brew install hebbs-ai/tap/hebbs
```

**Buttons:** `[Read the docs]` `[GitHub]` `[Join the community]`

---

## Key Messaging Changes Summary

| Element | Current | New |
|---------|---------|-----|
| Hero stat strip | 384ns writes · 114ns reads · 8ms recall | 4 strategies · Native consolidation · Auto decay · Zero config |
| Primary proof | Benchmark tables | Precision gaps (23%→91%, 15%→78%) |
| Primary emotion | "This is fast" | "This didn't exist before" |
| Secondary emotion | "This replaces 4 services" | "This works out of the box with your agent" |
| CTA action | Join waitlist | Install now |
| Latency story | Hero headline | Supporting section ("and it's fast too") |
| Skill story | Not mentioned | Dedicated section, second-biggest moment |
| Comparison anchor | Speed | Capability |

---

## Tagline Candidates

| Tagline | Use |
|---------|-----|
| **The memory engine for AI agents.** | Keep as primary — it's good |
| **Four ways to remember. Everyone else has one.** | Recall strategies section |
| **Your agent doesn't just store. It learns.** | Consolidation section |
| **One install. Your agent remembers.** | Skill/out-of-box section |
| **Cognition, not storage.** | Keep — philosophy line |
| **The cognitive infrastructure that didn't exist.** | Problem section |

---

## Implementation Phases

### Phase 1: Content rewrite (no design changes)
- Rewrite Hero copy (headline, subheadline, stat strip)
- Rewrite Problem section (capability framing)
- Add "Out of the Box" section (skill story)
- Reorder existing sections (recall strategies up, benchmarks down)
- Reframe comparison table (capability-first columns)
- Rewrite CTA

### Phase 2: Design adjustments
- New hero visual: not terminal benchmarks, but a diagram showing what agents can do with HEBBS (temporal chain, causal graph, consolidation flow)
- Recall strategies section gets the most visual investment — each strategy deserves an animated/interactive demo
- "Out of the box" section gets the `brew install` terminal + supported agent logos
- Benchmarks section gets collapsed/expandable treatment

### Phase 3: Interactive elements
- Live demo: paste a cue, see 4 strategies return different results
- "Try it now" terminal emulator showing the skill in action
- Agent logos strip (Claude Code, OpenClaw, extensible)

---

## What We Stop Saying

- "384 nanoseconds" in the hero (move to deep-dive benchmarks)
- "Sub-10ms" as the primary claim (becomes supporting evidence)
- "Nanosecond storage. Millisecond cognition." as a section header (too latency-focused)

## What We Start Saying

- "Four recall strategies. Everyone else has one."
- "Temporal: 91% precision. Similarity-only: 23%. That's the gap."
- "Works with Claude Code and OpenClaw. Zero configuration."
- "Your agent learns patterns, not just stores facts."
- "The cognitive infrastructure that didn't exist until now."
- "Install HEBBS. Your agent remembers."
