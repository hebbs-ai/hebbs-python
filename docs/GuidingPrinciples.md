# Guiding Principles: HEBBS Engineering Standards

These are the non-negotiable principles that govern every architectural decision, every code review, and every trade-off in the HEBBS codebase. Every engineer must internalize them. When two principles conflict, the ordering here determines which wins.

---

## 1. Hot Path Sanctity

**The hot path is sacred ground. Nothing enters it unless it is bounded, predictable, and fast.**

The hot path operations are: `remember`, `recall`, `prime`, `subscribe` push. These are the operations that agents call during live interactions -- voice calls, robot control loops, real-time task execution.

### Rules

- **No network calls on the hot path.** Embedding generation is local (ONNX). LLM calls belong exclusively to the background reflect pipeline. If a hot path operation requires a network call, the design is wrong.
- **No unbounded computation.** Every hot path code path must have a worst-case upper bound on execution time. Graph traversals are bounded by max depth. HNSW search is bounded by `ef_search`. Bloom filters gate expensive computation.
- **No heap allocations in tight loops.** Pre-allocate buffers, use arena allocators for batch operations, reuse vectors. Profile allocation counts, not just latency.
- **No locks on the read path.** Readers must never block on writers. Use lock-free structures, read-write locks with reader preference, or copy-on-write where needed.
- **No GC pauses. Ever.** This is why the language is Rust. Any FFI boundary (Python PyO3, ONNX Runtime) must be audited for GC interaction.

### Latency Budgets

These are not aspirations. They are contracts.

| Operation | p99 Budget | Breakdown |
|-----------|-----------|-----------|
| `remember` | 5ms | embed (3ms) + WAL write (1ms) + index hint (1ms) |
| `recall` (similarity) | 10ms | embed query (3ms) + HNSW search (5ms) + deserialize (2ms) |
| `recall` (temporal) | 5ms | B-tree range scan (2ms) + deserialize (3ms) |
| `recall` (causal) | 15ms | seed lookup (3ms) + bounded graph walk (10ms) + deserialize (2ms) |
| `subscribe` push | 8ms | bloom check (0.01ms) + coarse match (1ms) + fine search (5ms) + push (2ms) |

If a code change causes any of these to regress by more than 10%, the change does not merge.

---

## 2. Single Process, Zero Dependencies

**HEBBS ships as one binary. It depends on nothing at runtime except the operating system.**

### Rules

- **No external database processes.** RocksDB is embedded. There is no "install Postgres first" step.
- **No external services required for core functionality.** The core nine operations must work with zero network connectivity. LLM providers are optional and only used for reflect.
- **The binary is self-contained.** Embedding model is downloaded on first run (not compiled in), but once present, the system needs nothing from the network.
- **Startup is instant.** `hebbs-server` must be serving requests within 2 seconds of process start on a cold machine. Index loading is lazy or memory-mapped.
- **Shutdown is graceful.** SIGTERM triggers: stop accepting new requests, drain in-flight operations (max 5s timeout), flush WAL, close RocksDB cleanly. No data loss on clean shutdown.

### Test

The canonical test: unpack a tarball, run the binary, make a `remember` call. If this takes more than 60 seconds end-to-end on a fresh machine, the deployment model is broken.

---

## 3. Cognition, Not Storage

**HEBBS is not a database. It is a cognitive engine. Every feature must make the agent smarter, not just store more data.**

This is the principle that separates HEBBS from pgvector, Qdrant, Redis, and every other storage system. Storage is a means, not the end. The end is agent intelligence.

### Rules

- **Every write must be scored.** `remember()` requires an importance score. The system never blindly appends. If it stores everything equally, it is a database, not a memory.
- **Every read must be strategy-aware.** `recall()` requires a strategy. If the only retrieval mode is similarity search, this is a vector database with extra steps.
- **Decay is not optional.** Memories that are never accessed must fade. A system where signal-to-noise ratio degrades over time is failing at its core job.
- **Revision over append.** When `revise()` is called, the old belief is replaced (with lineage preserved). Two contradictory facts should never coexist in active memory.
- **Consolidation is built-in.** `reflect` is not an add-on. The path from raw episodes to distilled insights is a first-class pipeline, not a user-space hack.

### Decision Test

Before adding any feature, ask: "Does this make recall more precise, or just make storage more flexible?" If the answer is storage, it probably does not belong in HEBBS. Point the user to RocksDB directly.

---

## 4. Bounded Everything

**Every resource consumption, every traversal, every buffer has a configurable upper bound. Unbounded systems fail in production.**

### Rules

- **Memory usage is predictable.** Given N memories with D-dimensional vectors, RAM consumption must be calculable: `RAM ≈ N * (metadata_bytes + D * 4 + hnsw_overhead_per_node)`. No hidden caches that grow without bound.
- **Disk usage is predictable.** Same formula, different constants. RocksDB compaction amplification is bounded by tuned level ratios.
- **Graph traversal is bounded.** Default max depth: 10 hops. Configurable. Never unbounded. The system returns partial results with a truncation flag rather than traversing indefinitely.
- **Subscribe fan-out is bounded.** Each subscription has a max pending push queue. If the consumer cannot keep up, the oldest pushes are dropped (not buffered to infinity).
- **Reflect scope is bounded.** Each reflect run processes at most N memories (configurable). Processing all memories from the beginning of time is not a valid operation.
- **Request payloads are bounded.** Max content length per memory (default 64KB). Max batch size (default 1000). Max context depth. Reject oversized inputs at the API boundary.

### Panic Rule

If any code path can consume unbounded memory, unbounded disk, or unbounded time based on input size, it is a bug. Not a TODO -- a bug.

---

## 5. Background Intelligence, Foreground Speed

**Expensive computation runs in the background. The hot path never waits for intelligence.**

### Rules

- **Write path: ack first, index later.** `remember()` writes to the WAL and acknowledges immediately. Embedding generation and index updates happen asynchronously. The caller sees sub-millisecond response time.
- **Reflect is a background job.** It runs on a separate thread pool. It does not compete for resources with `recall` or `subscribe`. Reflect can be paused, throttled, or deprioritized without affecting the hot path.
- **Decay is a background sweep.** Periodic (configurable interval), incremental (process a batch per sweep), and interruptible (can be paused during high load).
- **Compaction is background.** RocksDB compaction is tuned for low impact on read latency: rate-limited writes during compaction, separate I/O priority.

### The Wall

There is a hard architectural wall between "hot path" and "background":

```
HOT PATH (latency-critical)          |  BACKGROUND (throughput-oriented)
─────────────────────────────────────|──────────────────────────────────
remember() → WAL ack                 |  WAL → embed → index temporal/vector/graph
recall() → query indexes             |  reflect: cluster → propose → validate → store
prime() → recall + merge             |  decay: score → mark → prune
subscribe() → bloom → match → push   |  compaction: RocksDB maintenance
                                     |  sync: push/pull with cloud hub
```

No code on the right side of this wall may block code on the left side. They communicate through lock-free queues and shared indexes with reader-writer separation.

---

## 6. Lineage Is the Moat

**Every transformation must be traceable. If you cannot explain where an insight came from, you cannot trust it, revise it, or invalidate it.**

### Rules

- **Every insight records its source memories.** When reflect produces an insight, it stores the list of `memory_id`s that contributed to it. This is not optional metadata -- it is a structural requirement stored in the graph index.
- **Every revision records its predecessor.** When `revise()` updates a memory, the graph index stores a `revised_from` edge. The history is recoverable.
- **Every forget is logged.** When `forget()` removes memories, a tombstone record captures what was forgotten and why (criteria match). This enables GDPR "proof of forgetting" and insight invalidation.
- **Insight invalidation is automatic.** When a memory that is a source of an insight is revised or contradicted by new evidence, the insight is flagged for re-evaluation. This is not a future feature -- it is a Phase 7 requirement.

### Why This Matters

Without lineage:
- A sales agent "knows" that discounts close deals, but the pricing policy changed. Without lineage, the system cannot identify which insights depend on the now-revised discount memory.
- A robot fleet shares insights across devices. A new device adds contradicting evidence. Without lineage, every insight must be re-evaluated from scratch.

Lineage is what makes HEBBS irreplaceable once adopted. It is the architectural moat.

---

## 7. Same API, Different Internals

**The API surface is identical for edge and cloud. Configuration determines behavior. Code paths may differ, but the developer-facing contract does not.**

### Rules

- **One set of protobuf definitions.** The `.proto` files define the contract. Edge mode and cloud mode implement the same RPCs.
- **Configuration, not code, selects behavior.** `vector_dimensions = 384` vs `1536`. `index_storage = "memory-mapped"` vs `"tiered"`. `llm_provider = "local"` vs `"anthropic"`. These are config flags, not different codebases.
- **Feature availability is a config concern.** Edge mode may not support multi-tenancy. Cloud mode may not support peer-to-peer sync. These are configuration-gated features, not separate products.
- **Client SDKs are deployment-agnostic.** `HEBBS("localhost:6380")` works whether the server is running in edge mode or cloud mode. The client does not need to know.

### Architectural Implication

This means the crate structure must cleanly separate the "what" from the "how":
- `hebbs-core` defines the operations (what).
- `hebbs-index`, `hebbs-storage`, `hebbs-embed`, `hebbs-reflect` provide the implementations (how).
- `hebbs-server` wires them together based on configuration.

If adding a cloud feature requires modifying `hebbs-core`, the abstraction is leaking.

---

## 8. Memories Are Events, Not State

**A memory is an observation that happened at a point in time. Two observations about the same entity are not a conflict -- they are two data points.**

### Rules

- **Writes are append-only at the storage level.** `remember()` always creates a new record. It never overwrites. Even `revise()` creates a new version and links to the old one.
- **Sync is conflict-free for memories.** Two devices remembering things about the same entity is not a conflict. Both observations are valid. Merge = append.
- **Conflicts only arise on derived data.** `revise()` (explicit belief update) and `reflect` insights (derived knowledge) can conflict across sync boundaries. These have explicit resolution rules:
  - `revise`: higher importance wins, ties broken by logical clock.
  - `forget`: authoritative (cloud wins).
  - Insights: flagged for re-evaluation via lineage tracking.
- **Memory IDs are globally unique and sortable.** ULIDs encode both uniqueness and temporal ordering. No coordination needed for ID generation across devices.

### Why This Matters

This principle eliminates the hardest class of distributed systems problems. CRDTs, consensus protocols, and vector clocks are unnecessary for the core memory append path. The only coordination needed is for derived data (insights), and that is handled by lineage-based re-evaluation.

---

## 9. Measure Everything, Regress Nothing

**Every operation emits metrics. Every release is benchmarked. Performance regressions are treated as bugs with the same severity as data loss.**

### Rules

- **Every hot path operation emits a latency histogram.** `remember_latency_ms`, `recall_similarity_latency_ms`, `recall_temporal_latency_ms`, `recall_causal_latency_ms`, `subscribe_push_latency_ms`. Histograms, not averages. p50, p95, p99, p999.
- **Resource gauges are always exported.** `memory_count`, `index_size_bytes` (per index type), `ram_usage_bytes`, `disk_usage_bytes`, `active_subscriptions`, `pending_reflect_queue`.
- **CI runs benchmarks on every PR.** A regression of > 10% on any p99 latency metric blocks the merge. This is automated, not aspirational.
- **The benchmark suite is public.** `hebbs-bench` is a first-class crate, not an afterthought. Third parties can reproduce every claimed number.
- **Soak tests run before every release.** 72-hour continuous load at 100K ops/sec. Latency drift > 5% over the run is a release blocker. Memory leaks are a release blocker.

### What Gets Measured

| Category | Metrics |
|----------|---------|
| Latency | p50/p95/p99/p999 per operation, per recall strategy |
| Throughput | ops/sec for remember, recall, subscribe pushes |
| Resources | RAM, disk, file descriptors, thread count, RocksDB compaction stats |
| Cognitive | Recall precision (requires labeled test set), insight count per reflect cycle, decay prune count |
| Errors | Failed operations, rejected inputs, LLM provider errors, sync failures |

---

## 10. API Elegance Over Feature Count

**Nine operations. Three groups. If a new feature cannot be expressed through the existing nine operations, it must justify its existence by being fundamentally different from all nine.**

### Rules

- **The API surface is deliberately small.** Write: `remember`, `revise`, `forget`. Read: `recall`, `prime`, `subscribe`. Consolidate: `reflect_policy`, `reflect`, `insights`. This is the complete surface. Resist the urge to add `search`, `query`, `find`, `get`, `list`, or any synonym.
- **Complexity lives behind simple interfaces.** `recall(cue, strategy)` hides the HNSW search, B-tree scan, graph traversal, multi-strategy merge, and result ranking. The caller specifies intent, not mechanism.
- **Defaults are opinionated.** `remember(experience)` should work with zero optional parameters and still produce a useful, indexed, embeddable memory. Importance can default to 0.5. Context can default to empty. Strategy can default to similarity.
- **Error surfaces are minimal.** Operations either succeed or fail with a clear error code. No partial success states on single operations. Batch operations return per-item results.
- **Breaking changes are versioned.** The protobuf contract is the API. Adding fields is fine. Removing or renaming fields requires a major version bump.

### The Instinct Test

A developer should be able to write their first HEBBS integration in < 50 lines of code without reading documentation beyond the README. If they need to understand column families, HNSW parameters, or RocksDB tuning to get started, the abstraction has failed.

---

## 11. Correctness Before Performance, But Design for Performance

**Get it right first, then make it fast. But never design yourself into a corner where fast becomes impossible.**

### Rules

- **Data integrity is non-negotiable.** A crash at any point during a `remember` call must not corrupt the database. RocksDB WAL provides this, but every layer above it must also be crash-safe. No "write index, then write data" sequences without atomicity.
- **Atomic multi-index updates.** When `remember()` updates temporal, vector, and graph indexes, all three updates must be in a single RocksDB WriteBatch. Partial index states (memory in vector index but not in temporal) are corruption.
- **Tests before optimizations.** Write the correct, readable implementation first. Add Criterion benchmarks. Then optimize with profiling data. Never optimize based on intuition.
- **Design for zero-copy from day one.** Even if the first implementation copies, the interfaces should not preclude zero-copy in the future. Return `&[u8]` slices where possible, not `Vec<u8>`. Accept `impl AsRef<str>`, not `String`.
- **Design for async from day one.** All I/O-bound operations are `async`. Even if the first implementation uses `block_on`, the trait signatures are async. Retrofitting async is orders of magnitude harder than starting with it.

---

## 12. Secure by Default, Compliant by Design

**Security and compliance are not features to add later. They are constraints that shape the architecture from day one.**

### Rules

- **Tenant isolation is structural, not logical.** Multi-tenant deployments use separate RocksDB column family prefixes per tenant. A bug in query logic cannot leak data across tenants because the storage boundary is physical.
- **Forget is real.** When `forget()` is called, the data is removed from all indexes, all column families, and the WAL is compacted past the deletion point. "Soft delete" is not sufficient for GDPR compliance. Tombstones record that deletion happened, not what was deleted.
- **Auth is on by default in server mode.** The default configuration requires an API key. Running without auth requires an explicit `--no-auth` flag to make the operator acknowledge the risk.
- **Inputs are validated at the boundary.** Every gRPC and HTTP handler validates input before it touches the engine. Max content length, valid UTF-8, depth limits on nested context structures. Invalid input is rejected with a clear error, never passed through.
- **Dependencies are audited.** `cargo audit` runs in CI. Known vulnerabilities are release blockers. Dependency count is minimized -- every new crate addition requires justification.

---

## Principle Priority Order

When two principles conflict, this ordering determines which wins:

1. **Correctness** (Principle 11) -- wrong results are worse than slow results
2. **Data integrity / Security** (Principle 12) -- data loss or leaks are unrecoverable
3. **Hot path latency** (Principle 1) -- the core value proposition
4. **Bounded resources** (Principle 4) -- unbounded systems fail in production
5. **API simplicity** (Principle 10) -- developer experience drives adoption
6. **Single binary** (Principle 2) -- deployment simplicity drives adoption
7. **Cognition over storage** (Principle 3) -- the strategic differentiator
8. **Lineage tracking** (Principle 6) -- the long-term moat
9. **Observability** (Principle 9) -- you can't fix what you can't see
10. **Background intelligence** (Principle 5) -- enables the cognitive features
11. **Event-based memory** (Principle 8) -- simplifies distributed operation
12. **API portability** (Principle 7) -- edge/cloud symmetry

---

## How to Use This Document

1. **Code review:** Every PR is evaluated against these principles. If a change violates one, the reviewer cites the principle number and the author either fixes it or documents why the violation is justified.
2. **Architecture decisions:** When debating two approaches, evaluate both against the priority-ordered principles. The approach that satisfies higher-priority principles wins.
3. **New feature proposals:** Must state which principles the feature serves and which (if any) it tensions against.
4. **Onboarding:** Every new contributor reads this document before writing code.
