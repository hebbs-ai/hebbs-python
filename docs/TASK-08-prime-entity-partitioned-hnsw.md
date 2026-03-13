# TASK-08: Prime Similarity — Replace Brute-Force with Entity-Partitioned HNSW

The current fix for prime's dead similarity component (brute-force cosine scan over entity memories) is correct but does not scale. This task tracks the long-term solution: entity-aware HNSW search that eliminates both the old post-filter fragility and the new O(n) linear scan.

## Current State (Post-Fix)

Prime's similarity phase was broken: it searched the global HNSW index and post-filtered by `entity_id` with `ENTITY_OVERSAMPLE=4`. When the target entity was a small fraction of total memories, the post-filter discarded most candidates, returning `similarity=0`.

The fix (`engine.rs` lines 902-946) replaced this with an entity-scoped brute-force scan:

1. Query temporal index with full time range (0..now) to get all entity memory IDs (capped at `PRIME_ENTITY_SCAN_LIMIT=500`).
2. Load each memory's embedding from storage.
3. Compute `cosine_similarity(cue_embedding, memory_embedding)` for each.
4. Sort by relevance, take top `similarity_limit`.

This works and all 103 tests pass, but has known limitations.

## Problems with the Brute-Force Approach

### 1. Latency regression
- **Old:** One HNSW search O(log n * ef_search) + ~40 point lookups for post-filter. ~1-2ms.
- **New:** Up to 500 storage reads + 500 dot products (384-dim). ~25-50ms.
- Prime is called at conversation start (agent priming), so latency matters for perceived responsiveness.

### 2. The 500 cap is lossy
- `PRIME_ENTITY_SCAN_LIMIT=500` queries the temporal index in `ReverseChronological` order, so it gets the 500 most recent entity memories.
- An older but highly relevant memory at position 501+ is invisible to similarity. The old HNSW approach, despite its filtering problem, at least searched the full vector space.
- The cap is necessary (Principle 4: Bounded Everything), but it introduces a recency bias in what should be a purely semantic ranking.

### 3. O(n) does not scale like O(log n)
- HNSW search is O(log n * ef_search). Brute-force is O(n * d).
- At 500 memories this is sub-millisecond. At the `MAX_PRIME_MEMORIES=200` output cap, the scan is fine.
- But if `PRIME_ENTITY_SCAN_LIMIT` needs to increase for entities with deep history, the linear scan becomes a bottleneck.

### 4. Error propagation change
- The old code silently swallowed embedding failures with `if let Ok(...)`, still returning temporal results.
- The new code uses `?`, propagating the error and failing the entire prime call.
- This is arguably better (no silent data loss), but changes partial-failure semantics. An agent calling prime during conversation start would get an error instead of degraded-but-partial results.

### 5. Dedup still zeros out similarity_count for small entities
- When all entity memories are recent and temporal captures them all, dedup removes every similarity result. `similarity_count` remains 0 even though the similarity phase is working.
- The E2E test (`h.prime(entityId="initech", maxMemories=20, similarityCue="enterprise evaluation")`) still shows `temporal=3, similarity=0` because there are only 3 initech memories and all are within the 7-day recency window.
- This is mathematically correct (no unique similarity contributions) but misleading to users/agents inspecting the counts.

## Proposed Long-Term Solution: Entity-Partitioned HNSW

### Option A: Per-Entity HNSW Graphs
Maintain a separate HNSW graph per entity (similar to how tenant graphs are already partitioned in `IndexManager.hnsw_graphs`).

**Pros:**
- O(log n_entity * ef_search) search, where n_entity << n_total.
- No post-filtering, no brute-force scan.
- Exact same search quality as global HNSW but scoped to entity.

**Cons:**
- Memory overhead: one graph per entity. Entities with 1-2 memories get a full HNSW structure.
- Insert cost: each `remember()` must insert into both global and entity-specific graphs.
- Graph lifecycle: need eviction/compaction for dormant entities (LRU similar to tenant graph eviction).

### Option B: HNSW with Pre-Filter Labels
Add entity_id as a label/tag on HNSW nodes. Modify the search to accept a filter predicate that prunes during graph traversal (not after).

**Pros:**
- Single graph, no memory overhead per entity.
- O(log n * ef_search) with filter applied during traversal — no wasted candidates.
- Standard approach in production vector databases (Pinecone, Qdrant, Weaviate all do this).

**Cons:**
- Requires modifying the HNSW implementation (`hebbs-index/src/hnsw/`) to support filtered search.
- Filter during traversal can reduce recall quality if the entity's memories are clustered in a sparse region of the graph.
- More complex implementation than Option A.

### Option C: Hybrid — Brute-Force Below Threshold, HNSW Above
Keep the current brute-force for entities with < N memories (where N ~ 200-500), switch to entity-partitioned HNSW for larger entities.

**Pros:**
- Brute-force is actually faster than HNSW for small n (no graph overhead).
- Only builds per-entity HNSW graphs for high-volume entities that need it.
- Simplest incremental path from current state.

**Cons:**
- Two code paths to maintain.
- Threshold tuning needed.

## Recommendation

**Option B (HNSW with pre-filter labels)** is the right long-term answer. It's the industry-standard approach, keeps a single graph, and scales to arbitrary entity counts without per-entity overhead. The current brute-force fix is acceptable as a stopgap while Option B is implemented.

## Scope

### Files Affected
- `hebbs-index/src/hnsw/graph.rs` — Add filtered search method
- `hebbs-index/src/hnsw/node.rs` — Add entity label storage on nodes
- `hebbs-index/src/manager.rs` — Add `search_vector_filtered()` API
- `hebbs-core/src/engine.rs` — Replace brute-force prime similarity with filtered HNSW call
- `hebbs-core/src/engine.rs` — Also fix `execute_similarity()` in recall (same post-filter fragility)

### Docs Affected
- `docs/GuidingPrinciples.md` — If latency budgets for prime change
- `docs/DocsSummary.md` — Index update

## Acceptance Criteria

1. `prime(entityId="initech", similarityCue="enterprise evaluation")` returns `similarity_count > 0` when entity has memories semantically related to the cue, even when those memories overlap with temporal results.
2. Prime similarity latency at p99 <= 5ms for entities with up to 10K memories (benchmark required).
3. No regression in recall similarity accuracy (existing recall tests pass).
4. Criterion benchmark comparing brute-force vs filtered HNSW at 1K, 10K, 100K total memories with varying entity fractions.
