# HEBBS Edge & Cloud Server Architecture

## The Two-Tier Architecture

HEBBS is a **single binary** that operates in two distinct deployment modes — not a gradient, but two fundamentally different operating environments selected via configuration.

The API is identical across both. `hebbs.remember()` and `hebbs.recall()` work the same whether the agent is running on a warehouse robot or a 1000-agent cloud fleet. The internals adapt.

---

## Main Server (Cloud Mode)

The cloud server is the **multi-tenant, always-online central hub**.

| Aspect | Details |
|--------|---------|
| **Target** | Multi-tenant agent fleets (thousands of agents) |
| **Storage** | Sharded RocksDB with tiered storage (HOT in RAM, WARM on SSD, COLD on S3) |
| **Vectors** | 1536-dim embeddings, distributed HNSW with product quantization |
| **Reflect** | Dedicated GPU fleet, cloud LLMs (Anthropic Claude, OpenAI), priority queuing per tier |
| **Scale** | 10B+ memories across tenants, 1M+ writes/sec |
| **Sync Role** | Acts as the **hub** — accepts connections from edge devices, coordinates fleet sync |

### Cloud-Specific Solutions

- **Decoupled write pipeline**: WAL ack immediately (sub-ms), embed + index asynchronously.
- **Tenant sharding**: Each tenant gets its own HNSW index (~60MB for 1M memories), horizontal scaling by adding nodes.
- **Tiered vector storage**: HOT (RAM, last 30 days, sub-ms recall), WARM (SSD, 30-180 days, 2-5ms recall), COLD (S3, 180+ days, 50-200ms recall).
- **Product quantization**: Compress vectors from 6KB to ~128 bytes (48x reduction, <3% recall quality loss).
- **Queued reflection**: Hash-based staggering across 6-hour windows to avoid thundering herd. Enterprise tier gets dedicated GPU capacity.
- **Hierarchical subscribe fan-out**: Bloom filter rejects 90%+ of inputs before expensive HNSW search.

### Example Configuration

```toml
[engine]
mode = "cloud"
vector_dimensions = 1536
index_storage = "tiered"

[reflect]
llm_provider = "anthropic"
llm_model = "claude-sonnet"

[sync]
role = "hub"
```

---

## Edge Server

The edge server runs on **powerful devices** (robots, laptops, workstations with 8-32GB RAM, GPU/NPU) and operates **fully autonomously**.

| Aspect | Details |
|--------|---------|
| **Target** | Single agent, single owner (robots, laptops, workstations) |
| **Storage** | Same RocksDB engine, memory-mapped HNSW on NVMe |
| **Vectors** | 384-dim by default (10M memories = ~3.8GB index) |
| **Reflect** | Full pipeline with **local LLMs** (Phi-3, Gemma-2B, Llama-3-8B via llama.cpp/MLX/Ollama) |
| **Offline** | Fully autonomous — all 9 operations work with zero connectivity |
| **Decay** | Aggressive defaults (14-day half-life, 5M memory cap) |
| **Sync Role** | Pushes to cloud hub when connected, pulls insights and fleet memories |

### Edge-Specific Solutions

- **On-device LLMs**: Full reflection pipeline runs offline. Statistical clustering (pure Rust) + local LLM for proposal/validation. Cloud re-validates with stronger model when connected.
- **Hardware-accelerated embedding**: MacBook M3 Neural Engine (~1ms), Jetson Orin GPU (~2ms), Intel NPU (~3ms), CPU fallback (~8ms). Auto-detected at startup.
- **Memory-mapped HNSW**: Index lives on NVMe SSD, OS pages hot portions into RAM. Recall latency 5-8ms instead of 2ms, but index can be arbitrarily large.
- **384-dim vectors by default**: 10M memories = ~3.8GB index, fits comfortably on 16GB devices.
- **Aggressive decay**: Keeps the working set sharp. Old, unreinforced memories fade faster than in cloud mode.
- **Cloud archival**: When connected, push cold memories to cloud storage. Full history accessible via cloud recall.

### Example Configuration

```toml
[engine]
mode = "edge"
vector_dimensions = 384
index_storage = "memory-mapped"

[reflect]
llm_provider = "local"
llm_model = "phi-3-mini"

[sync]
enabled = true
hub = "wss://fleet.example.com/hebbs"
interval = "30s"
namespace = "warehouse-fleet-01"

[decay]
enabled = true
half_life = "14d"
max_memories = 5_000_000
```

---

## How They Interact: The Sync Protocol

The sync model follows the core principle **"Memories are events, not state"** — two devices creating memories about the same entity is not a conflict, it's two observations.

### Sync Flow

1. **Edge pushes memories to cloud** — append-only, no conflict possible.
2. **Cloud pushes insights back to edge** — cloud-generated insights overwrite local insight cache.
3. **Cloud pushes fleet memories to edge** — memories from other devices/agents append to local store.
4. **Incremental re-reflect** on the merged memory set after sync completes.

### Conflict Resolution (Derived Data Only)

| Operation | Rule |
|-----------|------|
| `revise()` | Higher-importance evidence wins; ties broken by logical clock |
| `forget()` | Cloud is authoritative — if cloud says forget, edge forgets |
| Insights | Flagged for re-evaluation via lineage tracking |

### Fleet Mode (Multi-Device Coherence)

For fleets of devices (e.g., 50 warehouse robots) operating in the same environment:

```
Each device has:
  ├── Local namespace (private memories, device-specific)
  └── Shared namespace (fleet-wide knowledge, synced)
```

- When Robot #12 remembers "Aisle 7 blocked", it goes to the shared namespace.
- Synced to cloud hub on next connection.
- Cloud pushes to all other robots on their next sync.
- Direct **peer-to-peer gossip protocol** available when devices are on the same network, bypassing cloud entirely.

---

## Same API, Different Internals

The critical design choice: client SDKs are deployment-agnostic. `HEBBS("localhost:6380")` works regardless of edge or cloud mode. The difference is purely configuration.

| | HEBBS Edge | HEBBS Cloud |
|---|---|---|
| **Binary** | Same binary, edge config | Same binary, cluster deployment |
| **API** | All 9 operations | All 9 operations |
| **Storage** | RocksDB (same engine) | Sharded RocksDB |
| **Vector Index** | Full HNSW (384-dim), memory-mapped | Distributed HNSW with tiered storage |
| **Embedding** | ONNX on GPU/NPU/Neural Engine | GPU-batched inference |
| **Reflect** | Full pipeline with local LLM | Dedicated GPU fleet with priority queue |
| **Subscribe** | Full streaming support | Hierarchical fan-out |
| **Offline** | Full autonomous operation | N/A |
| **Sync** | Append-only push/pull with cloud | Central hub for fleet coordination |
| **Memory Cap** | Limited by local NVMe (1-10M) | Unlimited (tiered) |

---

## The Hardest Unsolved Problem

**Causal consistency of reflected insights across sync boundaries.**

1. Cloud reflects on memories A, B, C and produces Insight X.
2. Robot (offline) creates memories D, E, F that contradict memory B.
3. Robot reconnects and syncs D, E, F to cloud.
4. Insight X is now potentially invalid — but which part?

The solution: **lineage tracking**. Every insight records which source memories contributed to it. When new evidence arrives, the system knows exactly which insights to re-evaluate — not all of them.

```
Insight X:
  sources: [memory_A, memory_B, memory_C]
  confidence: 0.87

New memory D contradicts memory_B
  → Insight X flagged for re-evaluation
  → Incremental re-reflect on {A, B, C, D} only
  → Insight X either strengthened, revised, or invalidated
```

---

## Latency Budgets (Hard Contracts)

| Operation | p99 Budget |
|-----------|-----------|
| `remember` | 5ms |
| `recall` (similarity) | 10ms |
| `recall` (temporal) | 5ms |
| `recall` (causal) | 15ms |
| `subscribe` push | 8ms |

These are identical for edge and cloud. Edge achieves them with local hardware acceleration; cloud achieves them with tiered storage and tenant sharding.

---

## Build Status

Phases 1-9 are complete (storage, embedding, indexes, recall, write-path, subscribe, reflect, gRPC/HTTP server, CLI client). Phase 14 (Edge Mode and Sync) — where the edge/cloud distinction is fully implemented — is pending, blocked on Phase 13 (Production Hardening). The server binary exists and works today as a standalone server; edge-specific features (memory-mapped HNSW, local LLM reflection, sync protocol, fleet mode) are not yet built.

---

*Source: hebbs/docs/PhasePlan.md, ScalabilityArchitecture.md, GuidingPrinciples.md*
