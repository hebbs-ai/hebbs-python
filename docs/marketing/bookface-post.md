# YC Bookface Post

---

**I'm building HEBBS — a memory engine for AI agents. Single binary, sub-10ms, installs in seconds.**

Built DPSN (dpsn.org), a decentralized pub-sub network — saw firsthand how every agent team duct-tapes memory together: vector DB here, Redis there, a graph DB for good measure, and a custom decay pipeline nobody wanted to maintain. Then freelanced on a voice sales agent where latency was everything: five services just to give the agent memory, every hop a failure mode, and it still couldn't tell me what a prospect said last Tuesday. There's no native memory primitive built for agents. So I built one.

So I started building **HEBBS** (hebbs.ai). It's a single Rust binary with embedded storage. No Postgres. No Redis. No Pinecone. No infra to manage. The core operations:

- **remember** — store experiences with automatic importance scoring
- **recall** — four retrieval strategies (similarity, temporal, causal, analogical), all sub-10ms p99
- **reflect** — consolidate raw memories into distilled insights with full lineage tracking. This is how agents go from "I remember what you said" to "I know what I've learned"
- **revise** — update beliefs without appending contradictions
- **forget** — GDPR-safe targeted erasure, plus active pruning of stale knowledge

Everything is **100% configurable** but ships with smart defaults that worked well for me building the sales agent — so you don't need to tune anything on day one.

Here's a real example. Say you're building a voice agent that calls customers to gather iterative product feedback. Drop a `hebbs.toml`:

```toml
[decay]
enabled = true
half_life_days = 90        # feedback stays relevant longer than sales signals
auto_forget_threshold = 0.05

[reflect]
enabled = true
threshold_trigger_count = 30   # reflect after every 30 feedback calls
proposal_model = "gpt-4o"     # use whatever LLM you want for insight synthesis
```

Start the server — `hebbs-server` — done. Now your agent just talks to it:

```python
from hebbs import HebbsClient

async with HebbsClient("localhost:6380") as h:
    # after each call, store what the customer actually said
    await h.remember(
        "Customer hates the new onboarding flow — took 20 min, expected 5",
        importance=0.9,
        context={"customer": "acme", "topic": "onboarding", "sentiment": "negative"},
        entity_id="acme_corp",
    )

    # before the next call with the same customer, recall everything
    history = await h.recall("onboarding feedback", strategies=["temporal", "similarity"], entity_id="acme_corp")

    # after 30 calls, reflect consolidates raw feedback into product insights:
    #   → "Onboarding time is the #1 complaint — 74% of negative feedback mentions it"
    #   → "Customers who completed onboarding in <5 min have 3x higher retention"
    result = await h.reflect(entity_id="acme_corp")

    # tune recall scoring to weight recency over relevance for fresh feedback
    latest = await h.recall(
        "what changed since last month",
        strategies=["temporal"],
        scoring_weights={"w_recency": 0.6, "w_relevance": 0.2, "w_importance": 0.15, "w_reinforcement": 0.05},
        entity_id="acme_corp",
    )

    # customer requests data deletion — one call, GDPR compliant
    await h.forget(entity_id="acme_corp")
```

That's it. No infra to stand up. No embedding pipeline to build. No vector DB to tune. The config and the SDK are the entire integration surface.

What I've shipped: **CLI with full REPL, Python SDK, TypeScript SDK.** An agent can `pip install` or `npm install`, point at a config, and have a working brain in minutes.

Built for both **edge ( robots ) and server**. Run it embedded in your agent process for zero-latency local memory, or run the server for multi-agent setups. Reflect syncs only distilled insights to a master server — so your sub-agents stay lightweight while the fleet shares institutional knowledge.

The thesis: **agents that learn compound over time.** Call 500 is dramatically better than call 1 — not because the agent has more data, but because it has distilled knowledge. No current system delivers that. They give you storage with retrieval, but not learning.

Would love feedback from anyone building agents or thinking about agent memory. Happy to give early access.

**hebbs.ai**

---
