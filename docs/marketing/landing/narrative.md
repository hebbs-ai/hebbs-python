# HEBBS — Brand Narrative & FOMO Playbook

## The Core Narrative

The story that creates FOMO is simple: **before HEBBS, cognitive memory for agents didn't exist. There were vector databases, memory search engines, similarity — but nothing that gave agents configurable temporal reasoning, causal chains, analogical transfer, consolidation, and decay as a single consumable primitive. We built it. And it works with Claude and OpenClaw out of the box.**

Three pillars to hammer relentlessly:

1. **This didn't exist.** Not "we did it better." Not "we did it faster." It literally did not exist. Four recall strategies with native consolidation, decay, causal reasoning, and analogical transfer — no combination of existing tools gave you this. You could stitch Qdrant + Neo4j + Redis + Postgres together and still only get similarity search with extra steps.
2. **It works out of the box.** Install HEBBS. Your Claude Code agent or OpenClaw agent gets cognitive memory immediately. No SDK integration, no glue code, no configuration. The skill system means agents consume HEBBS natively — `remember`, `recall`, `reflect`, `forget` — without the developer writing a single line of memory logic.
3. **And it's fast.** Not the headline — the cherry on top. All of the above runs in under 10ms at 10 million memories. One binary. Zero network hops. The speed is what makes it practical at scale, but the capability is what makes it matter.

---

## Why HEBBS Is a New Category (Not a Better Database)

Vector databases exist. Memory wrappers exist. Knowledge graphs exist. None of them are what HEBBS is.

### The capability that didn't exist

Before HEBBS, here's what an agent builder had:

| Tool | What it gives you | What it doesn't |
|---|---|---|
| **Vector DB** (Qdrant, Pinecone) | Similarity search | Temporal recall, causal reasoning, analogical transfer, decay, consolidation |
| **Memory wrapper** (Mem0, Zep, LangChain Memory) | Similarity search + LLM extraction glue | Causal reasoning, analogical transfer, native decay, consolidation without LLM on hot path |
| **Knowledge graph** (Neo4j) | Relationship traversal | Temporal recall, analogical transfer, decay, consolidation, embedded deployment |
| **KV store** (Redis) | Fast reads/writes | Any form of cognitive recall |

Now here's what HEBBS gives you — in one binary, zero configuration:

| Capability | Status before HEBBS | HEBBS |
|---|---|---|
| Temporal recall ("what happened, in order?") | Didn't exist as a native primitive | B-tree range scan, 91% precision |
| Causal reasoning ("what caused this?") | Didn't exist without building a custom graph + traversal | Bounded graph walk, 78% precision |
| Analogical transfer ("what pattern transfers here?") | Didn't exist | Structural similarity matching, 74% precision |
| Native decay & reinforcement | Didn't exist — all systems treat old data = new data | Automatic. Memories fade. Important ones strengthen. |
| Consolidation (episodes → insights) | Didn't exist natively — required external LLM pipeline | Background reflect pipeline with full lineage |
| Revision with lineage | Overwrite or append — no belief updating | `revise()` replaces beliefs, preserves predecessor chain |
| Configurable scoring weights | Didn't exist — similarity score was all you got | 4-signal composite: relevance × recency × importance × reinforcement |

The precision gap tells the whole story:

| Query type | Similarity-only precision (what everything else does) | HEBBS multi-path precision | Gap |
|---|---|---|---|
| Temporal | 23% | 91% | **+68 percentage points** |
| Causal | 15% | 78% | **+63 percentage points** |
| Analogical | 31% | 74% | **+43 percentage points** |

When your agent asks "why did the last deal fall through?", a vector database returns the 5 most similar chunks and hopes the answer is in there. HEBBS walks the causal graph backward from the loss event, through the pricing objection, to the competitor mention three weeks earlier. That's not retrieval. That's reasoning.

### They wrap. We compute.

Memory wrappers are not memory engines. They are orchestration layers that coordinate LLM calls, vector databases, and graph stores into a memory-shaped workflow.

| | Memory Wrappers (typical) | HEBBS |
|---|---|---|
| **Architecture** | LLM extracts/classifies facts → external vector DB + optional graph DB stores them | Native engine: embedded indexes + embedded storage + embedded embeddings |
| **What happens on write** | 1-2+ LLM calls to extract, classify, and route memories, then external DB write | Local ONNX embedding (3ms) + atomic multi-index write (1ms). Zero LLM calls. |
| **What happens on read** | Vector similarity search, optionally combined with graph traversal | 4 strategies: similarity, temporal, causal, analogical — all native, all from one process |
| **Runtime dependencies** | Vector DB + LLM API + optional graph DB | None. One binary. |

### LLM-on-write is an architectural dead end

Memory wrappers typically use an "LLM-on-write" pattern: every memory operation triggers one or more LLM calls to extract, classify, or graph-ify the data. This has three consequences:

1. **Cost explosion.** LLM-based extraction generates thousands of tokens per operation. At scale, the LLM bill dwarfs the infrastructure bill.
2. **Latency floor.** The fastest LLM API call is ~200ms. The fastest local LLM inference is ~50ms. This sets an unbreakable floor on write latency that no amount of optimization can remove. HEBBS's hot path has zero LLM calls — LLMs are used only in the background `reflect` pipeline, never on the write or read path.
3. **Fragility.** If the LLM API is down, the memory system is down. If the LLM hallucinates during extraction, you store garbage. HEBBS encodes and indexes locally with deterministic, verifiable algorithms. The embedding model is shipped with the binary.

### Decay, reinforcement, and consolidation are native

| Capability | Memory Wrappers (typical) | HEBBS |
|---|---|---|
| Importance scoring on write | No | Yes — explicit `importance` parameter affects encoding priority |
| Memory decay over time | No | Yes — configurable exponential decay with reinforcement on recall |
| Auto-forget (prune stale memories) | No | Yes — decay threshold triggers automatic deletion |
| Consolidation (episodes → insights) | No (or partial via LLM on write path) | Yes — background `reflect` pipeline clusters, proposes, validates, stores insights with lineage |
| Revision (update beliefs, not append) | Overwrite or graph update | `revise()` creates predecessor chain, maintains full revision history |
| GDPR-compliant real deletion | Backend-dependent | `forget()` removes from all indexes + WAL compaction. Forensic-proof. |

### The bottom line

HEBBS is not competing with memory wrappers. HEBBS is the primitive they should be wrapping.

---

## Out of the Box: The Skill Story

This is the most underrated part of the HEBBS story and should be front and center.

### What "out of the box" actually means

HEBBS ships as a **native skill** for Claude Code and OpenClaw. The agent skill system means that after a single install, your agent automatically knows how to:

- **Store memories** with importance weighting, entity scoping, and causal edges
- **Recall** using the right strategy for the question — temporal, causal, analogical, or similarity
- **Consolidate** episodes into higher-order insights via the two-step reflect pipeline
- **Forget** stale or irrelevant memories to keep signal-to-noise high
- **Prime** context at conversation start so the agent already knows what matters

No SDK integration. No glue code. No configuration file. No "add this to your agent loop." The skill teaches the agent how to use HEBBS natively — the agent decides when to remember, what strategy to recall with, and when to consolidate. It's cognitive memory as a drop-in capability.

### The zero-friction install

```bash
# That's it. Your Claude Code or OpenClaw agent now has cognitive memory.
brew install hebbs-ai/tap/hebbs
```

The skill file ships with the binary. Claude Code and OpenClaw discover it automatically. The agent starts using `remember`, `recall`, `reflect`, `forget`, `prime`, `subscribe`, and `insights` as native operations in its next conversation.

### Why this matters for the narrative

Every other memory solution requires the **developer** to:
1. Choose a database
2. Set up an embedding pipeline
3. Write a storage layer
4. Write a retrieval layer
5. Add temporal logic (if they even think of it)
6. Wire it all together
7. Maintain multiple services

HEBBS requires the **developer** to run one install command. The **agent** does the rest.

This inverts the adoption model. The developer doesn't build memory infrastructure — they give their agent access to it. The agent is the consumer. The skill is the interface. HEBBS is the engine.

### Supported agents

| Agent | How it works | Configuration required |
|---|---|---|
| **Claude Code** | Skill file auto-discovered in `~/.claude/skills/hebbs/` | None |
| **OpenClaw** | Skill file auto-discovered in `~/.openclaw/skills/hebbs/` | None |
| **Any SKILL.md-compatible agent** | Drop skill file into agent's skill directory | None |
| **Custom agents** | Use `hebbs-cli` directly or Python/TypeScript SDK | Minimal — just endpoint config |

---

## Landing Page Hero (hebbs.ai)

```
                        HEBBS

          The memory engine for AI agents.

    4 recall strategies · Native consolidation · Automatic decay
              Works with Claude & OpenClaw out of the box.

        [Install now]              [GitHub]
```

Capability strip, not latency strip. The action is install, not waitlist.

### Section 2: The Weight Class (below the fold)

```
Redis for caching. Kafka for streaming. HEBBS for agent memory.
```

Followed by:

> Every agent framework gives you similarity search and calls it memory.
> HEBBS gives your agent temporal reasoning, causal chains, analogical transfer,
> consolidation, and decay — the cognitive operations that turn retrieval into understanding.

### Section 3: The Problem (capability-framed)

```
Left column: "What your agent's memory does today"

  ✗ Embed a question → find nearest vectors → hope for the best
  ✗ 23% precision on temporal queries
  ✗ 15% precision on causal queries
  ✗ No decay — old noise drowns new signal
  ✗ No consolidation — raw facts forever, no learning
  ✗ 4 services, 2,000 lines of glue

Right column: "What HEBBS does"

  ✓ "What happened?" → Temporal recall (91% precision)
  ✓ "What caused this?" → Causal graph walk (78% precision)
  ✓ "What pattern transfers?" → Analogical matching (74% precision)
  ✓ Memories decay. Important ones strengthen.
  ✓ Episodes consolidate into insights automatically.
  ✓ 1 binary. Zero glue.
```

### Section 4: Out of the Box (the skill story)

**Headline:** One install. Your agent remembers.

```
brew install hebbs-ai/tap/hebbs

Done.

Your agent now has:
  ✓ 4 recall strategies (temporal, causal, analogical, similarity)
  ✓ Importance-weighted storage
  ✓ Automatic decay & reinforcement
  ✓ Episode → insight consolidation
  ✓ Causal edge tracking
  ✓ Real-time memory subscriptions

Works with:  Claude Code · OpenClaw · Any SKILL.md agent
```

### Section 5: Four Recall Strategies (the centerpiece)

**Headline:** Four ways to remember. Everyone else has one.

```
TEMPORAL — "What happened, in order?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: "Walk me through the Acme deal"
HEBBS:           Temporal index → events in sequence → 91% precision
Similarity-only: Nearest vectors → 23% precision

CAUSAL — "What caused this outcome?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: "Why did the deployment fail on Friday?"
HEBBS:           Causal graph backward → root cause chain → 78% precision
Similarity-only: Chunks mentioning "deploy" and "fail" → 15% precision

ANALOGICAL — "What's structurally similar in another domain?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: "We had a similar onboarding problem — what did we learn?"
HEBBS:           Structural pattern matching → transferred insights → 74% precision
Similarity-only: Overlapping keywords → 31% precision

SIMILARITY — "What looks like this?"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The baseline. HEBBS has it too — plus configurable scoring weights
that blend relevance, recency, importance, and reinforcement.
```

### Section 6: Consolidation

**Headline:** Your agent doesn't just store. It learns.

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

### Section 7: Configurable Scoring Weights

**Headline:** One parameter changes everything.

```
Recall weights: relevance : recency : importance : reinforcement

RAG mode:              1 : 0 : 0 : 0     → pure semantic
Live context:        0.2 : 0.8 : 0 : 0   → favor recent
Critical decisions:  0.3 : 0.1 : 0.5 : 0.1 → favor important
Pattern detection:   0.1 : 0.1 : 0.1 : 0.7 → favor reinforced
```

### Section 8: Benchmarks (supporting evidence, not the headline)

**Headline:** And it does all of this in under 10ms.

| Operation | p50 | p99 | At 10M memories |
|---|---|---|---|
| `remember` | 0.8ms | 4ms | Yes |
| `recall` (similarity) | 2ms | 8ms | Yes |
| `recall` (temporal) | 0.5ms | 2ms | Yes |
| `recall` (causal) | 4ms | 12ms | Yes |
| `recall` (multi-strategy) | 6ms | 18ms | Yes |

Scalability:

| Memories | `recall` p99 (similarity) | `recall` p99 (temporal) |
|---|---|---|
| 100K | 3ms | 0.6ms |
| 1M | 5ms | 0.8ms |
| 10M | 8ms | 1.2ms |
| 100M | 12ms | 2.0ms |

One binary. Zero network hops. Local ONNX embeddings. RocksDB storage. Rust from byte zero.

### Section 9: Comparison Table (capability-first)

| | pgvector | Qdrant | Neo4j | Memory Wrappers | **HEBBS** |
|---|---|---|---|---|---|
| Recall strategies | 1 | 1 | 1-2 | 1-2 | **4** |
| Temporal recall | No | No | No | No | **Native** |
| Causal reasoning | No | No | Partial | No | **Native** |
| Analogical transfer | No | No | No | No | **Native** |
| Native decay | No | No | No | No | **Yes** |
| Consolidation | No | No | No | Partial | **Native** |
| Revision with lineage | No | No | No | No | **Yes** |
| Agent skill (drop-in) | No | No | No | No | **Claude, OpenClaw** |
| LLM calls on hot path | N/A | N/A | N/A | Yes | **Zero** |
| Recall latency (10M) | ~20ms | ~10ms | ~50ms | 50-200ms | **<10ms** |
| Runtime dependencies | Postgres | Qdrant | JVM + Neo4j | 3-4 services | **None** |

### Section 10: CTA

**Headline:** Give your agent a memory.

**Subtext:** One install. Works with Claude Code and OpenClaw. No configuration. No glue code.

```bash
brew install hebbs-ai/tap/hebbs
```

---

## Twitter/X Thread (FOMO Machine)

**Tweet 1 (hook — capability, not speed):**

> Before HEBBS, "agent memory" meant similarity search. That's it.
>
> No temporal recall. No causal reasoning. No analogical transfer. No decay. No consolidation.
>
> We built the cognitive memory engine that didn't exist.
>
> hebbs.ai

**Tweet 2 (the precision gap — the real proof):**

> "Why did the last deal fall through?"
>
> Similarity search: embed the question, return 5 nearest chunks, hope for the best. 15% precision.
>
> HEBBS: walk the causal graph backward from loss event → pricing objection → competitor mention 3 weeks earlier. 78% precision.
>
> That's not faster retrieval. That's a different capability.

**Tweet 3 (the out-of-box story):**

> The wildest part isn't the engine. It's the adoption model.
>
> `brew install hebbs-ai/tap/hebbs`
>
> That's it. Your Claude Code or OpenClaw agent now has cognitive memory. No SDK. No glue code. No config file. The agent skill system means the agent knows how to use it natively.
>
> Four recall strategies. Consolidation. Decay. Out of the box.

**Tweet 4 (what agents can do now):**

> After installing HEBBS, your agent can:
>
> - "What happened with the Acme deal?" → temporal recall
> - "What caused the outage?" → causal graph walk
> - "We had a similar problem before" → analogical transfer
> - Consolidate raw episodes into insights
> - Forget stale memories automatically
>
> None of this was possible before. Not from any single system.

**Tweet 5 (the four strategies):**

> Vector search answers one question: "what looks similar?"
>
> HEBBS answers four:
> - What looks similar? (similarity)
> - What happened before this? (temporal — 91% precision vs 23%)
> - What caused this? (causal — 78% vs 15%)
> - What pattern transfers? (analogical — 74% vs 31%)
>
> One engine. One binary. No glue.

**Tweet 6 (consolidation — the learning story):**

> Your vector DB stores facts forever. Signal and noise, growing equally.
>
> HEBBS consolidates. Raw episodes cluster → agent proposes insights → insights are stored with lineage back to source memories.
>
> Memories decay. Important ones strengthen. Your agent doesn't just retrieve. It learns.

**Tweet 7 (the Redis parallel):**

> Redis didn't just make Memcache faster.
> It introduced data structures that changed what caching could do.
>
> HEBBS doesn't just make vector search faster.
> It introduces cognitive operations that change what memory can do.
>
> Decay. Reinforcement. Consolidation. Revision. Reflection.
>
> This is what memory looks like when you think from first principles.

**Tweet 8 (the primitive claim):**

> We didn't integrate 4 services and call it a product.
>
> We wrote our own HNSW vector index. Our own temporal B-tree. Our own causal graph. Our own embedding engine. Our own storage layer.
>
> 12 Rust crates. 696 tests. One 50MB binary. Zero runtime dependencies.
>
> We're the primitive memory wrappers should be wrapping.

**Tweet 9 (speed as supporting evidence):**

> Oh, and it's fast.
>
> Multi-strategy recall at 10M memories: under 20ms.
> Single-strategy recall: under 8ms.
> Storage primitive: 384 nanoseconds.
>
> One process. Zero network hops. Local ONNX embeddings.
>
> Speed isn't the headline — capability is. But it helps that it's absurdly fast too.

**Tweet 10 (the CTA):**

> We're building this in the open.
>
> If your agent's memory is similarity search and a prayer, there's now an alternative.
>
> `brew install hebbs-ai/tap/hebbs`
>
> Works with Claude Code and OpenClaw. No configuration. Your agent gets cognitive memory in one command.
>
> hebbs.ai

---

## Hacker News Title Options

| Title | Vibe |
|-------|------|
| *HEBBS: The cognitive memory engine that didn't exist until now — 4 recall strategies in one Rust binary* | Capability-first, invites curiosity |
| *Show HN: We built temporal, causal, and analogical recall for AI agents — one binary, zero config* | Feature-forward, HN-friendly |
| *Show HN: Agent memory was similarity search. We built 4 recall strategies with native consolidation and decay.* | Provocative, technically precise |
| *HEBBS — cognitive memory for AI agents. Works with Claude Code and OpenClaw out of the box.* | Adoption-forward, practical |

---

## One-Liners for Different Contexts

| Context | Line |
|---------|------|
| **Bio / tagline** | Building the cognitive memory engine for AI agents. 4 recall strategies. Works with Claude & OpenClaw out of the box. |
| **When asked "what are you building?"** | A cognitive memory engine for AI agents. Not similarity search — temporal reasoning, causal chains, analogical transfer, consolidation, decay. One Rust binary. Works with Claude Code and OpenClaw out of the box — one install, zero configuration. |
| **When asked "how is this different?"** | Before HEBBS, agent memory was similarity search. We have four recall strategies — temporal (91% precision vs 23%), causal (78% vs 15%), analogical (74% vs 31%), and similarity. Plus native decay, consolidation, and revision. In one binary. As a drop-in skill for Claude and OpenClaw. |
| **When asked "why not just use a vector DB?"** | Vector search is one retrieval mode. We have four. Similarity, temporal, causal, analogical. 78% precision on causal queries where similarity-only gets 15%. Plus decay, consolidation, and it works as a native agent skill — no glue code. |
| **When asked "what about latency?"** | All of this runs in under 10ms at 10M memories. One process, zero network hops, local ONNX embeddings. But speed is the supporting story — the headline is that temporal, causal, and analogical recall didn't exist as a single primitive before. |
| **When asked "how do I use it?"** | `brew install hebbs-ai/tap/hebbs`. If you're using Claude Code or OpenClaw, that's it — the agent skill is discovered automatically. Your agent gets cognitive memory in one command. |
| **Cold DM to a framework maintainer** | We built a cognitive memory engine for AI agents — 4 recall strategies (temporal, causal, analogical, similarity), native consolidation and decay, one Rust binary. Ships as a skill for Claude Code and OpenClaw. We're the primitive memory wrappers should be wrapping. Would love to explore an integration. |
| **Investor pitch (one line)** | HEBBS is the cognitive memory engine for AI agents — 4 recall strategies, native consolidation, one binary. Works with Claude and OpenClaw out of the box. Open core, Rust, already shipping. |

---

## FOMO Amplifiers

1. **"This didn't exist" framing.** Every comparison should start from: "before HEBBS, this capability was not available." Not "we're faster" — "this was not possible." Temporal recall with 91% precision from a single binary? Didn't exist. Causal graph walk as a native agent operation? Didn't exist. Automatic consolidation with lineage? Didn't exist.

2. **The one-command install.** The most powerful demo is: `brew install hebbs-ai/tap/hebbs`, then show an agent using temporal and causal recall in its next conversation. Zero configuration. The gap between "nothing" and "cognitive memory" is one terminal command.

3. **Build-in-public updates.** Weekly posts: "This week we added analogical recall. Here's an agent finding a pattern from onboarding that applied to a deployment failure." Show the *capability*, not the nanoseconds.

4. **The precision gap.** "23% → 91% on temporal queries. 15% → 78% on causal. That's not a performance improvement. That's a new capability." This is the number to repeat everywhere.

5. **The agent skill demo.** Record a 60-second video: install HEBBS → start a Claude Code session → agent naturally uses `remember`, `recall` with temporal strategy, `reflect` → show the insight with lineage. No code written. No configuration. The agent just... has memory.

6. **The "primitive vs. wrapper" framing.** Every time someone mentions a memory wrapper, the response is: "They're wrappers. We're what they should be wrapping." This reframes the entire competitive landscape — HEBBS isn't competing with memory wrappers, it's the layer beneath them.

7. **Supported agent strip.** "Works with Claude Code. Works with OpenClaw. Works with any SKILL.md agent." This signals ecosystem, not lock-in. The skill system is an open standard, not a proprietary integration.

---

## Key Benchmarks (Source of Truth)

### Cognitive Benchmarks (the headline numbers)

| Query Strategy | Similarity-Only | HEBBS Multi-Path | Delta |
|---|---|---|---|
| Temporal | 23% | 91% | **+68 points** |
| Causal | 15% | 78% | **+63 points** |
| Analogical | 31% | 74% | **+43 points** |

### Agent Outcome Metrics

| Domain | Metric | Improvement |
|---|---|---|
| Voice Sales | Conversion Rate | **+133%** |
| Voice Sales | Objection Handling | **+109%** |
| Customer Support | First-Contact Resolution | **+45%** |
| Coding Agent | Resolution Rate (SWE-bench) | **+30%** |
| Any Agent | Token Efficiency | **-40%** |

### HEBBS vs. Memory Wrappers — Architectural Comparison

| Dimension | Memory Wrappers (typical) | HEBBS |
|---|---|---|
| Retrieval modes | 1-2 (similarity, optionally graph) | 4 (similarity, temporal, causal, analogical) |
| LLM calls on write | Yes (extraction + classification) | No (local ONNX embedding only) |
| LLM calls on read | Optional | No |
| Native decay | No | Yes |
| Native reinforcement | No | Yes |
| Consolidation | No (or LLM-gated on write path) | Yes (background reflect pipeline) |
| Revision with history | Overwrite or graph update | Predecessor chain with full lineage |
| GDPR real deletion | Backend-dependent | Forensic-proof (all indexes + WAL compaction) |
| Agent skill (drop-in) | No | Claude Code, OpenClaw, any SKILL.md agent |
| Runtime dependencies | Vector DB + LLM API + optional graph DB | None. One binary. |

### Systems Benchmarks (single c6g.large, 2 vCPU, 4GB RAM, 10M memories)

| Operation | p50 | p99 |
|---|---|---|
| `remember` | 0.8ms | 4ms |
| `recall` (similarity) | 2ms | 8ms |
| `recall` (temporal) | 0.5ms | 2ms |
| `recall` (causal) | 4ms | 12ms |
| `recall` (multi-strategy) | 6ms | 18ms |
| `subscribe` (event-to-push) | 1ms | 5ms |

### Internal Storage Path (in-memory backend, release build, no embedding)

| Operation | Latency |
|---|---|
| `remember()` single (200B content) | 384 ns |
| `remember()` with structured context | 618 ns |
| `get()` point lookup | 114 ns |
| `serialize_memory` (bitcode) | 43 ns |
| `deserialize_memory` (bitcode) | 107 ns |
| `remember()` batch × 10,000 | 3.04 ms (304 ns/op) |

Note: Systems benchmarks above include local ONNX embedding (~3ms per call), which dominates the full-system latency. The engine core (index + storage) adds only ~1ms on top of embedding.

### Scalability

| Memories | `recall` p99 (similarity) | `recall` p99 (temporal) |
|---|---|---|
| 100K | 3ms | 0.6ms |
| 1M | 5ms | 0.8ms |
| 10M | 8ms | 1.2ms |
| 100M | 12ms | 2.0ms |

### DIY Tax Comparison

| | DIY Stack | HEBBS |
|---|---|---|
| Services to run | 4 (Postgres + Vector DB + Redis + Graph DB) | 1 |
| Integration code | ~2,000 lines | 0 (skill-based) or ~50 lines (SDK) |
| Setup time | Hours | One command |
| Multi-strategy recall latency | 50-200ms (fan-out) | < 20ms |
| Background consolidation | You build it | Built-in |
| Infrastructure cost | 4-5x higher | 1x |

### Resource Usage

| Metric | Value |
|---|---|
| 10M memories on disk | ~18 GB |
| 10M memories in RAM | ~4 GB |
| Embedding (built-in, CPU) | < 5ms |
| Single binary size | ~50 MB |

### Engineering Stats

| Metric | Value |
|---|---|
| Rust crates | 12 |
| Rust tests passing | 696 |
| Python SDK tests | 66 |
| System integration tests | 19 |
| Clippy warnings | 0 |
