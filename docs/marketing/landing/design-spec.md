# HEBBS — Landing Page Design Spec (hebbs.ai)

## Governing Principle

The site should feel like the product: fast, precise, no wasted cycles. Every pixel earns its place, the same way every function in the codebase justifies its existence. If Redis, Cloudflare, and a research paper had a website together — that's HEBBS.

---

## Visual References

| Site | What to steal | URL |
|---|---|---|
| **Turso** | Dark theme, code-first hero, database-primitive energy | turso.tech |
| **Neon** | Dark, glowing accent color, benchmark numbers as design element | neon.tech |
| **Fly.io** | Developer-facing tone, dark with personality, monospace confidence | fly.io |
| **Cloudflare** | Technical authority, numbers front and center, "we're infrastructure" energy | cloudflare.com |
| **Vercel** | Speed of loading, minimal layout, dark hero with one CTA | vercel.com |
| **Linear** | Typography precision, spacing discipline, premium-but-technical | linear.app |
| **Qdrant** | Competitor awareness — see what they do, then be sharper | qdrant.tech |

**Do NOT reference:** Mem0 (startup-y, SaaS-y), LangChain (framework-y, cluttered), generic AI landing pages (gradient blobs, "AI-powered" everything).

---

## Color Palette

Dark mode only. No light mode toggle. Infrastructure tools don't need light mode. The darkness signals: "this is for people who live in terminals."

| Role | Color | Hex | Usage |
|---|---|---|---|
| **Background** | Near-black | `#0A0A0B` | Page background |
| **Surface** | Dark gray | `#141415` | Cards, code blocks, sections |
| **Border** | Subtle gray | `#1E1E20` | Dividers, card borders |
| **Primary text** | Off-white | `#EDEDEF` | Headlines, body text |
| **Secondary text** | Muted gray | `#8A8A8E` | Descriptions, labels |
| **Accent** | Electric amber | `#F59E0B` or `#FF8800` | Numbers, CTAs, key stats |
| **Code/numbers** | Cyan | `#22D3EE` | Monospace numbers, inline code |
| **Success/speed** | Muted green | `#34D399` | Benchmark comparisons, "faster" indicators |

### Why Amber

Warm, urgent, stands out against dark backgrounds without feeling "techy blue" (every AI startup) or "hacker green" (overplayed). Redis uses red. Qdrant uses purple. Neon uses green. Amber is unclaimed in the agent-infra space and feels like a warning light — which fits "your agent's memory is broken, here's the fix."

---

## Typography

| Role | Font | Style |
|---|---|---|
| **Headlines** | **Inter** or **Geist Sans** | Bold, tight letter-spacing (-0.02em), large sizes |
| **Body** | Same sans-serif | Regular weight, line height 1.6 |
| **Code / numbers** | **JetBrains Mono** or **Geist Mono** | All benchmarks, code blocks, terminal output, hero stats |
| **Logo** | Custom wordmark or **Space Grotesk** | Geometric, all-caps "HEBBS", tracked out slightly |

### Key Rule

Every number on the page is in monospace. Every number is in the accent color. Numbers are the hero, not words.

---

## Page Structure

### Section 1: Hero

Minimal. Dark. The headline is a category claim. The proof strip is the visual. Two CTAs.

```
[Nav: HEBBS logo | Docs | GitHub | Blog | Waitlist button]


                        HEBBS

          The memory primitive for AI agents.

        384ns writes · 114ns reads · 8ms recall at 10M


        [Join the waitlist]        [GitHub]
```

**Design notes:**
- "HEBBS" in the logo font, large, top-center.
- Headline in the primary sans-serif, bold, single line.
- Proof strip in monospace, accent-colored numbers. This IS the hero visual. No illustration. No abstract art. The numbers glow slightly (subtle text-shadow or border glow on a dark surface card).
- Generous vertical spacing above and below. The hero should breathe. Confidence is whitespace.
- No subheadline. No paragraph. One claim, one proof strip, two buttons. Done.

---

### Section 2: The Weight Class

One line. Centered. Secondary text color. This is the "oh, it's THAT kind of project" moment.

```
Redis for caching. Kafka for streaming. HEBBS for agent memory.
```

**Design notes:**
- Single line of text, centered, secondary text color (`#8A8A8E`).
- "Redis", "Kafka", and "HEBBS" in primary text color or slightly brighter — they pop against the muted surrounding text.
- No cards. No boxes. Just the sentence floating with generous vertical padding above and below.
- This section is a breath between the hero and the problem. It reframes the reader's mental model in one line.

---

### Section 3: The Problem

Split layout. Left: text. Right: the DIY tax diagram.

```
Left:                                    Right:

"Agent memory was never built.            Postgres
It was stitched together."                + Qdrant
                                          + Redis
Your agent's memory is 4 services,        + Neo4j
2,000 lines of glue, and a prayer.        + 2,000 lines of glue
                                          ─────────────────────
One retrieval mode. No decay.             4 services. 50-200ms.
No consolidation. No causal
reasoning.                                vs.

                                          hebbs-server
                                          ─────────────────────
                                          1 binary. <10ms.
```

---

### Section 4: The 9 Operations

Three columns: Write | Read | Consolidate. Each operation is a small card with the name, one-line description, and a tiny code snippet. Clean grid.

```
WRITE                  READ                   CONSOLIDATE

remember()             recall()               reflect_policy()
Store with             4 strategies:          Configure background
importance scoring     similarity, temporal,  consolidation
                       causal, analogical
revise()                                      reflect()
Update beliefs,        prime()                Manual trigger
not append             Pre-load context
                                              insights()
forget()               subscribe()            Query distilled
Real deletion.         Real-time push.        knowledge
GDPR-proof.            Knowledge surfaces
                       automatically.
```

---

### Section 5: Four Recall Strategies

Full-width. Four cards side by side. Each card has:
- Strategy name (bold, large)
- Question it answers (secondary text)
- Concrete example (body text)
- Precision stat (accent color, large monospace number)

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  SIMILARITY  │ │   TEMPORAL   │ │    CAUSAL    │ │  ANALOGICAL  │
│              │ │              │ │              │ │              │
│ "What looks  │ │ "What        │ │ "What caused │ │ "What's      │
│  like this?" │ │  happened?"  │ │  this?"      │ │  similar in  │
│              │ │              │ │              │ │  another     │
│ Find similar │ │ Reconstruct  │ │ Walk the     │ │  domain?"    │
│ objection    │ │ prospect's   │ │ causal graph │ │              │
│ responses    │ │ full history │ │ backward     │ │ Apply finance│
│              │ │              │ │              │ │ patterns to  │
│              │ │  91%         │ │  78%         │ │ healthcare   │
│              │ │  precision   │ │  precision   │ │  74%         │
│              │ │  (vs 23%)    │ │  (vs 15%)    │ │  (vs 31%)    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

### Section 6: Benchmarks

The section engineers scroll to. Two subsections:

**A) Storage primitive — engine core**

Clean table showing HEBBS's own storage primitive latency. Monospace, accent-colored numbers. No competitor comparison — the numbers speak for themselves.

| Operation | Latency |
|---|---|
| remember (storage path) | 384 ns |
| get (point lookup) | 114 ns |
| serialize (bitcode) | 43 ns |
| delete | 84 ns |
| batch write (10K) | 3.04 ms |

Footnote: Embedded engine, release build, 200B structured memories. Includes ULID generation, validation, and bitcode serialization. No embedding, no indexing.

**B) Cognitive recall at scale — scalability table**

Numbers at 100K, 1M, 10M, 100M memories. Each row shows memory count and p99 latency. Monospace, accent color.

| Memories | recall p99 (similarity) | recall p99 (temporal) |
|---|---|---|
| 100K | 3ms | 0.6ms |
| 1M | 5ms | 0.8ms |
| 10M | 8ms | 1.2ms |
| 100M | 12ms | 2.0ms |

---

### Section 7: Architecture Diagram

The ASCII diagram from the README rendered as a clean SVG/graphic. Dark background, labeled boxes with subtle borders, accent-colored connection lines. Show: Client SDKs → gRPC/HTTP → Core Engine → Index Layer → Storage Engine. Everything inside one box / one process.

---

### Section 8: "Why not just use..."

Clean table comparing HEBBS vs. pgvector vs. Qdrant vs. Neo4j vs. KV Stores vs. Memory Wrappers. Each row is a capability. Checkmarks where true (including for competitors), dashes where false. Factual, not aggressive. The table does the talking. Competitors get credit where due — Qdrant gets checks for single binary and embedded mode, KV Stores get a check for single binary. Honesty makes the unique capabilities more credible.

8 capability rows:
- No LLM on hot path
- Multi-strategy recall (4 modes)
- Native decay & reinforcement
- Background consolidation (reflect)
- Causal reasoning
- Atomic multi-index operations
- Single binary, zero deps
- Embedded mode (no server needed)

---

### Section 9: Code Example

Single beautiful code block. Full flow: remember → recall (all 4 strategies) → subscribe → reflect. Python SDK. Syntax highlighted. Copy button. Dark surface background.

---

### Section 10: CTA

```
     The memory primitive for AI agents.
          Built in the open.

           [Join the waitlist]

          github.com/hebbs-ai/hebbs
```

---

### Footer

Minimal. Single row of links:
Docs | GitHub | Blog | Twitter | License (BSL 1.1) | parag@hebbs.ai

---

## Design Principles

1. **Numbers are the hero.** Every section has at least one hard number. Numbers are always monospace, always accent-colored, always larger than surrounding text.

2. **Code is the visual.** Where other sites use illustrations, HEBBS uses code blocks, terminal output, and architecture diagrams. The product IS the visual.

3. **Negative space is confidence.** Generous padding between sections. No cramming. A site that breathes says "we don't need to shout."

4. **No animations except speed.** The only acceptable animation: numbers counting up or latency comparisons animating in. Everything else is static. Fast sites feel fast.

5. **Mobile: stack, don't shrink.** On mobile, comparison panels stack vertically. Benchmark numbers stay large. Code blocks scroll horizontally. Never shrink the numbers.

---

## Logo

The name "HEBBS" in a geometric sans-serif or monospace font. All-caps. Slightly tracked out. No icon. No mascot. No logomark.

Infrastructure projects don't need cute logos — they need recognition. Redis is just "redis" in a font. Kafka is just "kafka" in a font. HEBBS is just "HEBBS" in a font.

Optionally: a subtle "neural connection" motif (two dots connected by a line) that can be used as a favicon and small-format icon. Inspired by Hebbian learning — "neurons that fire together wire together." But this is secondary to the wordmark.

---

## What to Avoid

| Avoid | Why | Instead |
|---|---|---|
| Gradient blobs / abstract shapes | Every AI startup looks like this | Code blocks, architecture diagrams |
| "AI-powered" / "intelligent" badges | Generic, says nothing | Specific numbers: "384ns", "78% precision" |
| Light mode | Signals consumer product, not infrastructure | Dark only |
| Illustrations of robots / brains | Cliché, not technical | Terminal, benchmarks, code |
| Testimonials (for now) | No users yet | Benchmark proof instead |
| Pricing page (for now) | Too early | "Join waitlist" is the only CTA |
| Multiple CTAs per section | Dilutes focus | One CTA: waitlist. One secondary: GitHub star |
| Feature comparison with 30 rows | Nobody reads it | 6-8 capabilities max |
| Carousel / slider | Signals marketing fluff | Static content, scrollable |
| Cookie banner | Annoying, and if you're not tracking, you don't need one | Don't add tracking. No cookies, no banner. |
| "Trusted by" logos | You don't have them yet, and fake ones destroy credibility | Earn them first, add later |

---

## Tech Stack for the Site

Keep it simple. The site is a landing page, not a web app.

| Choice | Why |
|---|---|
| **Astro** or **Next.js (static export)** | Fast, static, good DX, great for dark-themed sites |
| **Tailwind CSS** | Utility-first, dark mode built-in, consistent spacing |
| **Vercel** or **Cloudflare Pages** | Free tier, fast CDN, instant deploys |
| **Plausible** or **nothing** | Privacy-friendly analytics, or no analytics at all (no cookie banner needed) |

The site should load in under 1 second. If the product is measured in nanoseconds, the website can't take 3 seconds to render.
