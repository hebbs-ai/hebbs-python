# Experience Demo: "Watch an Agent Learn"

## The One-Sentence Pitch

A self-serve web experience where anyone — in under 3 minutes, with zero setup — watches an AI agent go from dumb to expert across conversations, with every HEBBS operation rendered in real-time so they see exactly *how* and *why* the learning happens.

This is not a demo. This is the product, experienced from the inside.

---

## Why This Exists

From the first sales call: "Redis already working, unclear immediate value."

That objection dies the moment someone *watches* an agent learn. You can't explain learning. You have to show it compounding in front of their eyes. And you have to show the engine — the recall scores, the strategy selection, the insight lineage — so they understand this isn't magic, it's infrastructure they can own.

The goal: by the time someone books a call with you, they've already decided to use HEBBS. The call is about integration, not convincing.

---

## Ruthless Scope: What Ships vs. What Doesn't

### Ships (v1 — target: 7 days)

| Component | Description |
|---|---|
| Chat panel | Type freely or click pre-built scenario buttons |
| Engine inspector | Scrolling event log showing every HEBBS operation with latency, scores, details |
| Memory timeline | Visual strip showing memories accumulating, insights appearing, decay dimming |
| Pre-built scenarios | 3 clickable sequences (5-call learning arc, returning customer, belief cascade) |
| Reflect button | Manual trigger that visibly consolidates memories into insights |
| "World Changed" button | Fires revise(), shows insight invalidation + re-reflection |
| Latency scoreboard | Running p99 for remember/recall/reflect — always visible |
| Code reveal | Toggle to see the 50-line Python agent powering the conversation |

### Does NOT Ship (v1)

| Cut | Why |
|---|---|
| Force-directed graph visualization | Cool but adds 2+ weeks. The event log + timeline conveys the same information faster. Ship the graph in v2 after the core experience proves itself. |
| 3D brain visualization (Three.js) | Spectacle over substance. Save for the conference demo. |
| User auth / saved sessions | Nobody needs to log in to be convinced. Ephemeral sessions are fine. |
| Multi-entity switching in UI | The pre-built "returning customer" scenario handles this. Free-form entity switching is a power feature for v2. |
| Mobile responsive | Desktop-only is fine. This is a technical audience. |
| Custom LLM provider selection | Hardcode one provider. Don't add config UI that distracts from the experience. |

---

## The Three Panels

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  hebbs.ai/playground             HEBBS Experience    [< 10ms p99]  [Code] │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│                      │                      │                               │
│   CONVERSATION       │   ENGINE INSPECTOR   │   LEARNING TIMELINE           │
│                      │                      │                               │
│  ┌────────────────┐  │  ┌────────────────┐  │   Conversation 1  ●●          │
│  │ Pre-built:     │  │  │ RECALL  1.2ms  │  │   Conversation 2  ●●●         │
│  │ [5-Call Arc]   │  │  │ similarity: 3  │  │   Conversation 3  ●●●●●       │
│  │ [Returning]    │  │  │ temporal: 1    │  │   ── reflect() ──             │
│  │ [World Change] │  │  │ scores: ...    │  │   Conversation 4  ●●●●● ★     │
│  └────────────────┘  │  └────────────────┘  │   Conversation 5  ●●●●●●● ★★  │
│                      │  ┌────────────────┐  │                               │
│  ┌────────────────┐  │  │ REMEMBER 0.8ms │  │   ★ = insight                 │
│  │ Type message   │  │  │ importance: 0.9│  │   ● = memory                  │
│  │ or watch the   │  │  │ context: {...} │  │   ○ = decayed                  │
│  │ scenario play  │  │  └────────────────┘  │                               │
│  └────────────────┘  │  ┌────────────────┐  │   ┌────────────────────────┐  │
│                      │  │ REFLECT  340ms │  │   │  INSIGHTS              │  │
│  Agent: "Based on    │  │ clusters: 3    │  │   │  ★ "ROI before price   │  │
│  your previous       │  │ insights: 2    │  │   │    closes 3x better"   │  │
│  mention of..."      │  │ sources: 8→2   │  │   │    ← mem_3, mem_7      │  │
│                      │  └────────────────┘  │   └────────────────────────┘  │
│                      │                      │                               │
├──────────────────────┴──────────────────────┴───────────────────────────────┤
│  [Reflect Now]   [World Changed]   Memories: 14  Insights: 2  Calls: 5    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Panel 1: Conversation (Left)

The familiar part. A chat interface. Two modes:

**Scenario mode (default):** Three buttons at the top. Click one and the conversation auto-plays — messages appear one at a time with realistic pacing (1-2 seconds between turns). The user watches. They can pause, or click "Skip to next turn" to speed through.

**Free mode:** Type anything. The agent responds using HEBBS for memory. For visitors who want to poke at it.

The key: the conversation itself is deliberately unremarkable. A sales agent talking to a prospect. What makes it remarkable is the middle panel showing what's happening underneath.

### Panel 2: Engine Inspector (Center)

Every HEBBS operation appears as a card in a scrolling feed, in real-time, as it fires:

**REMEMBER card:**
- Content stored (truncated)
- Importance score (with a colored bar: green = high, yellow = medium)
- Context metadata (key-value pairs)
- Entity ID
- Latency (bold, prominent — this is the flex)

**RECALL card:**
- Strategies used (similarity, temporal, causal) with individual hit counts
- Top results with scores and strategy attribution ("why this memory was recalled")
- Latency breakdown: embed time vs engine time
- This is the card that shows people HEBBS isn't just vector search

**REFLECT card (when triggered):**
- Memories processed → clusters found → insights created
- Each insight shown with its source memories linked (lineage)
- Latency
- This is the "aha" card

**REVISE card (when "World Changed" fires):**
- The revised fact
- Dependent insights that were invalidated
- New insights that emerged from re-reflection
- This is the "jaw drop" card

Each card has a subtle animation on entry (slide in from right, brief glow in the operation's color). Cards stack chronologically. Older cards compress/collapse to keep the feed readable.

### Panel 3: Learning Timeline (Right)

A vertical timeline showing the agent's knowledge state across conversations:

- Each conversation is a row
- Dots represent memories created during that conversation (sized by importance)
- Stars represent insights (appear after reflect)
- Faded dots represent decayed memories
- When reflect runs, a horizontal divider appears with "reflect()" label, and insight stars appear below it
- An "Insights" section at the bottom lists all current insights with source lineage

The timeline is the visual proof of compounding. After 5 conversations, the right panel is dense with memories and insights. On conversation 1, it was empty. That progression — visible at a glance — is what no README or pitch deck can convey.

---

## The Three Pre-Built Scenarios

### Scenario 1: "The Learning Arc" (default, ~2 minutes)

Five sequential sales conversations with different prospects. The agent starts generic and gets visibly sharper.

| Call | Prospect | What happens in HEBBS |
|---|---|---|
| 1 | First-time prospect, asks about pricing | remember() stores 2 memories. recall() returns nothing (empty brain). Agent gives generic response. |
| 2 | Different prospect, same pricing objection | recall() finds the memory from call 1 (similarity). Agent handles it better using prior context. Inspector shows the recall hit. |
| 3 | Prospect mentions competitor | remember() stores competitor intel with high importance. recall() pulls pricing + competitor memories. Agent synthesizes both. |
| 4 | Prospect asks about ROI | recall() fires temporal + similarity. Agent references specific details from prior calls. Timeline shows 8+ memories accumulated. |
| 5 | Similar objection to call 1 | After auto-reflect between call 4 and 5, the agent has insights. recall() returns insights alongside memories. Agent's response is noticeably more strategic. Inspector shows insight being used. |

After call 5, the bottom bar shows: "Memories: 12, Insights: 3, Calls: 5." The timeline is visually dense. The latency scoreboard shows sub-10ms across the board.

### Scenario 2: "The Returning Customer" (~1 minute)

Two conversations with the same entity, separated by a "2 weeks later" label.

| Phase | What happens |
|---|---|
| Call 1 | Normal conversation. Prospect mentions Zendesk, 50k tickets, Q4 deadline. 4 memories stored. |
| "2 weeks later" | Visual divider in the timeline. |
| Call 2 | prime() fires. Inspector shows all 4 memories loaded for this entity. Agent opens with "Last time we spoke, you mentioned your Q4 deadline with Zendesk..." — without being told to. Inspector shows temporal recall pulling chronologically ordered history. |

The point: the agent remembers. Not because it has a transcript — because it has structured memories with temporal ordering. The inspector proves it.

### Scenario 3: "The World Changed" (~1.5 minutes)

Three conversations, then a belief revision.

| Phase | What happens |
|---|---|
| Calls 1-3 | Agent learns that "Competitor X doesn't support SSO" and uses this in objection handling. reflect() produces insight: "Lead with SSO gap when Competitor X comes up." |
| User clicks "World Changed" | revise() fires: "Competitor X now supports SSO." Inspector shows: revised memory stored → 2 dependent insights invalidated → re-reflect triggered → new insight: "Shift Competitor X positioning from SSO gap to integration depth." |
| Call 4 | Agent automatically uses the new strategy. No human edited a playbook. No prompt was rewritten. |

This is the climax. The inspector's REVISE card showing cascading invalidation and re-reflection is the moment that separates HEBBS from every vector database on the market.

---

## Architecture

### Frontend

```
experience-demo/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx                # Landing → redirect to /playground
│   ├── playground/
│   │   └── page.tsx            # The three-panel experience (client component)
│   ├── api/                    # Backend API routes (server-side, Node.js runtime)
│   │   ├── hebbs/
│   │   │   ├── remember/route.ts   # POST — wraps @hebbs/sdk remember()
│   │   │   ├── recall/route.ts     # POST — wraps @hebbs/sdk recall()
│   │   │   ├── prime/route.ts      # POST — wraps @hebbs/sdk prime()
│   │   │   ├── revise/route.ts     # POST — wraps @hebbs/sdk revise()
│   │   │   ├── forget/route.ts     # POST — wraps @hebbs/sdk forget()
│   │   │   ├── reflect/route.ts    # POST — wraps @hebbs/sdk reflect()
│   │   │   ├── insights/route.ts   # GET  — wraps @hebbs/sdk insights()
│   │   │   └── health/route.ts     # GET  — wraps @hebbs/sdk health()
│   │   └── chat/route.ts           # POST — LLM proxy (keeps API key server-side)
│   └── layout.tsx
├── components/
│   ├── ChatPanel.tsx               # Conversation panel with scenario buttons
│   ├── InspectorPanel.tsx          # Engine event log
│   ├── TimelinePanel.tsx           # Memory/insight accumulation viz
│   ├── InspectorCard.tsx           # Individual operation card (REMEMBER, RECALL, etc.)
│   ├── ScenarioButton.tsx          # Pre-built scenario trigger
│   ├── InsightsList.tsx            # Current insights with lineage
│   ├── LatencyScoreboard.tsx       # Running p99 display
│   ├── CodeReveal.tsx              # Toggle to show the agent code
│   └── BottomBar.tsx               # Reflect/WorldChanged buttons + counters
├── lib/
│   ├── hebbs-singleton.ts          # Server-side @hebbs/sdk HebbsClient singleton
│   ├── api-client.ts               # Client-side fetch wrapper for /api/hebbs/* routes
│   ├── scenarios.ts                # Pre-scripted conversation sequences
│   ├── agent.ts                    # Client-side agent orchestration logic
│   └── types.ts                    # Shared types (mirroring @hebbs/sdk types for client)
├── public/
│   └── fonts/
├── docs/
│   └── PLAN.md                     # This file
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Backend: `@hebbs/sdk` over gRPC

The backend is a set of **Next.js API routes** (App Router, `app/api/`) that wrap the `@hebbs/sdk` npm package. The SDK connects to the HEBBS server over gRPC (port 6380). This is the correct architecture because:

1. **gRPC cannot run in the browser.** `@grpc/grpc-js` requires Node.js. The SDK must live server-side.
2. **API keys stay server-side.** Both the HEBBS API key and the LLM API key never touch the client.
3. **The SDK is the showcase.** We're eating our own dogfood — the demo runs on the same `@hebbs/sdk` package our customers install.
4. **Latency is accurately measured.** Each API route times the SDK call and returns the real latency in the response, so the inspector shows true engine time, not network round-trip.

#### Server-side Singleton (`lib/hebbs-singleton.ts`)

```typescript
import { HebbsClient } from '@hebbs/sdk';

let client: HebbsClient | null = null;

export async function getHebbs(): Promise<HebbsClient> {
  if (!client) {
    client = new HebbsClient(
      process.env.HEBBS_SERVER_ADDRESS || 'localhost:6380',
      { apiKey: process.env.HEBBS_API_KEY },
    );
    await client.connect();
  }
  return client;
}
```

#### API Route Pattern (example: `app/api/hebbs/remember/route.ts`)

Every HEBBS API route follows the same pattern — call the SDK, time it, return the result plus latency:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getHebbs } from '@/lib/hebbs-singleton';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const hebbs = await getHebbs();

  const start = performance.now();
  const memory = await hebbs.remember({
    content: body.content,
    importance: body.importance,
    context: body.context,
    entityId: body.entityId,
  });
  const latencyMs = performance.now() - start;

  return NextResponse.json({
    data: {
      id: memory.id.toString('hex'),
      content: memory.content,
      importance: memory.importance,
      context: memory.context,
      entityId: memory.entityId,
      createdAt: memory.createdAt,
      kind: memory.kind,
      decayScore: memory.decayScore,
      accessCount: memory.accessCount,
    },
    _meta: { latencyMs, operation: 'remember' },
  });
}
```

The `_meta` object is critical — it's what the inspector panel reads to display accurate latency. Every route returns `_meta.latencyMs` and `_meta.operation`.

#### Client-side API Wrapper (`lib/api-client.ts`)

The frontend calls a thin wrapper that hits the API routes and extracts both data and meta:

```typescript
export async function hebbsRemember(params: RememberParams) {
  const res = await fetch('/api/hebbs/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json = await res.json();
  return { data: json.data, meta: json._meta };
}
```

The inspector receives the `meta` alongside the data and renders the operation card with the real SDK-measured latency.

#### Full API Route Map

| Route | Method | SDK Call | Inspector Card |
|---|---|---|---|
| `/api/hebbs/remember` | POST | `hebbs.remember()` | REMEMBER |
| `/api/hebbs/recall` | POST | `hebbs.recall()` | RECALL |
| `/api/hebbs/prime` | POST | `hebbs.prime()` | PRIME |
| `/api/hebbs/revise` | POST | `hebbs.revise()` | REVISE |
| `/api/hebbs/forget` | POST | `hebbs.forget()` | FORGET |
| `/api/hebbs/reflect` | POST | `hebbs.reflect()` | REFLECT |
| `/api/hebbs/insights` | GET | `hebbs.insights()` | Insights list |
| `/api/hebbs/health` | GET | `hebbs.health()` | Latency scoreboard |
| `/api/chat` | POST | OpenAI/Anthropic SDK | LLM CHAT |

#### Why Not REST API Directly?

The HEBBS server exposes a REST API on port 6381, but we deliberately route through the `@hebbs/sdk` gRPC client because:

1. **Dogfooding.** The demo proves the SDK works. If a visitor asks "how does the TypeScript SDK connect?", the answer is "exactly like this demo."
2. **Full type safety.** The SDK returns typed objects (`Memory`, `RecallOutput`, `ReflectResult`), not raw JSON.
3. **gRPC is faster.** Binary serialization + HTTP/2 multiplexing = lower latency than REST. The latency numbers in the inspector are even more impressive.
4. **Subscribe support.** The REST API uses SSE for subscriptions, but the SDK uses gRPC server streaming, which is more robust. Future v2 subscribe features will rely on this.

### Deployment (AWS)

HEBBS server and the Next.js app run as **separate processes on AWS**. They are not bundled together.

**HEBBS server:**
- Runs independently on an AWS EC2 instance (or ECS)
- gRPC on port 6380, REST on port 6381
- Configured via `hebbs.toml` with its own LLM provider settings for reflect (model, provider, API keys)
- Can be restarted, reconfigured, or swapped independently of the demo app
- All HEBBS configuration (decay, reflect triggers, embedding provider, tenancy limits) is managed via the server's own `hebbs.toml` and env vars — not by the demo app

**Next.js app:**
- Runs as a long-running Node.js process (`next start`) on a separate EC2 instance or same machine on a different port
- Connects to the HEBBS server via `HEBBS_SERVER_ADDRESS` env var (e.g., `10.0.1.5:6380` or `localhost:6380`)
- Holds a persistent gRPC connection via `@hebbs/sdk` singleton — no cold starts
- LLM API key for conversation generation configured via `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) env var
- Ephemeral sessions: each visitor gets a unique entity_id prefix, data is wiped hourly via cron
- Rate limiting via Next.js middleware

**Environment variables for the Next.js app:**

| Variable | Required | Description |
|---|---|---|
| `HEBBS_SERVER_ADDRESS` | Yes | gRPC address of the HEBBS server (e.g., `localhost:6380`) |
| `HEBBS_API_KEY` | If auth enabled | API key for the HEBBS server |
| `OPENAI_API_KEY` | Yes (or Anthropic) | LLM key for conversation generation |
| `LLM_MODEL` | No | Model to use (default: `gpt-4o`) |
| `LLM_PROVIDER` | No | `openai` or `anthropic` (default: `openai`) |
| `SESSION_TTL_HOURS` | No | Hours before ephemeral session data is wiped (default: `1`) |

This separation means you can tweak HEBBS server config (swap reflect LLM, change decay half-life, adjust tenancy limits) without touching the demo app, and vice versa.

---

## Design Principles

### 1. The inspector is the product

The conversation is the hook. The inspector is the pitch. If someone covers the left panel and only reads the middle panel, they should still understand why HEBBS matters. Every card must be self-explanatory.

### 2. Latency is always visible

A persistent scoreboard in the top-right shows running p99 for remember, recall, and reflect. The latency numbers appear on every inspector card. This is HEBBS's strongest technical claim — make it impossible to miss.

### 3. Progression is visceral

The right panel (timeline) should tell the story at a glance: empty → sparse → dense → insights appearing. A visitor who glances at the screen for 2 seconds should see "something is accumulating." That visual density is the learning curve made tangible.

### 4. Zero friction

No sign-up. No API key. No install. Click the URL, click "Start," watch. The first interaction happens in under 3 seconds. If someone has to read instructions, the design failed.

### 5. Dark theme, monospace inspector

The chat panel is clean and modern (Inter/system font). The inspector panel is dark with monospace type (JetBrains Mono) — it should feel like watching a live system log. The contrast between the two panels communicates: left is the product your users see, middle is the engine you own.

---

## Visual Design: Apple Liquid Glass

The entire UI follows Apple's Liquid Glass design language — frosted translucent surfaces, layered depth, soft luminous glows, and fluid motion. This isn't a dark dashboard. It's a living, breathing system that feels like looking through glass into the engine.

### The Glass Aesthetic

**Surfaces:** Every panel, card, and container uses `backdrop-filter: blur()` over a dark gradient background. Panels are not opaque boxes — they are translucent glass layers stacked at different depths. The background subtly shifts (a slow-moving gradient or faint mesh pattern) so the blur has something to refract.

**Borders:** No hard borders. Panels are separated by 1px borders with `rgba(255,255,255,0.08)` — barely visible glass edges. Active/focused elements get a slightly brighter border glow (`rgba(255,255,255,0.15)`).

**Depth:** Three visual layers:
1. **Background** — deep dark gradient with faint animated mesh or noise texture
2. **Panel glass** — `backdrop-blur(20px)`, `background: rgba(15,15,25,0.6)`, subtle inner shadow
3. **Card glass** — `backdrop-blur(12px)`, `background: rgba(20,20,35,0.5)`, sits on top of panel glass with slight elevation

Inspector cards float on the panel surface. When a new card enters, it pushes existing cards down with a fluid physics feel, not a hard snap.

**Light:** Accent colors don't fill backgrounds — they glow. A REMEMBER card has a soft green luminous edge, not a green background. Think: light bleeding through frosted glass. Use `box-shadow` with colored spread for the glow effect, not `background-color`.

### Color System

| Element | Treatment | Value |
|---|---|---|
| Background | Deep gradient | `linear-gradient(135deg, #0a0a12, #0d0d1a, #080815)` |
| Panel glass | Frosted translucent | `rgba(15,15,25,0.6)` + `backdrop-blur(20px)` |
| Card glass | Lighter translucent | `rgba(20,20,35,0.5)` + `backdrop-blur(12px)` |
| Glass border | Subtle edge | `rgba(255,255,255,0.08)`, active: `rgba(255,255,255,0.15)` |
| REMEMBER glow | Green luminance | `#22c55e` as `box-shadow: 0 0 20px rgba(34,197,94,0.15)` |
| RECALL glow | Blue luminance | `#3b82f6` as `box-shadow: 0 0 20px rgba(59,130,246,0.15)` |
| REFLECT glow | Amber luminance | `#f59e0b` as `box-shadow: 0 0 20px rgba(245,158,11,0.15)` |
| REVISE glow | Red luminance | `#ef4444` as `box-shadow: 0 0 20px rgba(239,68,68,0.15)` |
| FORGET glow | Neutral dim | `#6b7280` as `box-shadow: 0 0 12px rgba(107,114,128,0.1)` |
| Insight star | Gold with bloom | `#ffc857` + `filter: drop-shadow(0 0 6px rgba(255,200,87,0.4))` |
| Memory dot | Cyan with soft glow | `#06b6d4` + `box-shadow: 0 0 8px rgba(6,182,212,0.3)` |
| Decayed dot | Faded cyan | `#06b6d4` at 25% opacity, glow removed |
| Latency numbers | Bright white | `#ffffff`, slight text glow on sub-5ms values |
| Body text | Soft light gray | `#c8ccd4` |

### Typography

- Chat panel: Inter (or SF Pro if available), 15px
- Inspector cards: JetBrains Mono, 13px
- Latency numbers: JetBrains Mono, bold, 14px — sub-5ms values get a subtle green text-shadow
- Insight content: Inter, italic, 14px
- Section labels: Inter, 11px uppercase tracking-wide, `rgba(255,255,255,0.4)`

### Glass CSS Pattern (reference for implementation)

```css
.glass-panel {
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 4px 24px rgba(0, 0, 0, 0.3);
}

.glass-card {
  background: rgba(20, 20, 35, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.glass-card[data-operation="remember"] {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 0 20px rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.15);
}
```

### Animations

All transitions should feel **fluid and physical** — spring-based easing, not linear or cubic-bezier. Framer Motion's spring physics are the default.

- **Inspector cards:** Slide in from right with spring physics (`stiffness: 300, damping: 25`). Entry glow pulses once in the operation's accent color (400ms bloom, 600ms fade). Cards compress smoothly as new ones push them up.
- **Timeline dots:** Scale from 0 → 1 with spring overshoot. Glow bloom on entry (200ms).
- **Insight stars:** Scale + gentle rotate (15deg) with spring, gold bloom that lingers 800ms.
- **Reflect divider:** Glass line draws left-to-right, 400ms, with a traveling light shimmer along its length.
- **"World Changed" cascade:** Insight cards dim one by one with 100ms stagger. Their glow fades from amber to gray. Then new insights bloom in from nothing with gold glow. The whole sequence should feel like watching light propagate through glass.
- **Background mesh:** Extremely slow continuous drift (60s cycle). Barely perceptible but gives the blur something to refract, making the glass feel alive.

---

## The Code Reveal

A toggle button labeled `[< > Code]` in the top bar. When clicked, the left panel (conversation) is replaced by a syntax-highlighted view showing both the TypeScript and Python agent — tabs to switch between them. The TypeScript version is default since the demo itself runs on `@hebbs/sdk`:

```typescript
import { HebbsClient } from '@hebbs/sdk';

const hebbs = new HebbsClient('localhost:6380');
await hebbs.connect();

// Prime: load everything we know about this prospect
const primed = await hebbs.prime({ entityId: 'acme_corp' });

// Recall: find relevant memories using multiple strategies
const recalled = await hebbs.recall({
  cue: prospectMessage,
  strategies: ['similarity', 'temporal'],
  entityId: 'acme_corp',
});

// Generate response using recalled memories as context
const response = await llm.chat(prospectMessage, { context: recalled });

// Remember: store what mattered from this exchange
await hebbs.remember({
  content: extractKeyInfo(prospectMessage, response),
  importance: scoreImportance(prospectMessage),
  context: { topic: classify(prospectMessage) },
  entityId: 'acme_corp',
});

// After N conversations, consolidate into knowledge
const insights = await hebbs.reflect({ entityId: 'acme_corp' });
// Insights are now used in future recall() automatically

// When the world changes, update beliefs
await hebbs.revise(outdatedMemory.id, { content: 'New competitive info...' });
// Dependent insights auto-invalidate and re-reflect

// GDPR deletion — one call
await hebbs.forget({ entityId: 'acme_corp' });
```

The code is annotated with comments that map to what the visitor just saw in the inspector. The simplicity-to-capability ratio is the final punch. The Python tab shows the equivalent using `hebbs` Python SDK — proving the same 30-line experience works in both ecosystems.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR for first load, API routes as gRPC-to-HTTP bridge |
| HEBBS SDK | `@hebbs/sdk` (gRPC) | Our own npm package — dogfooding in production |
| Backend | Next.js API routes (Node.js) | Server-side gRPC client, keys never touch the browser |
| Styling | Tailwind CSS | Fast iteration, dark theme trivial |
| Animations | Framer Motion | Inspector card animations, timeline transitions |
| Syntax highlighting | Shiki | Code reveal panel |
| Fonts | Inter + JetBrains Mono | Via next/font, no FOUT |
| State management | Zustand | Lightweight, one store for the entire playground state |
| LLM | OpenAI SDK (server-side) | Proxied through `/api/chat`, key never exposed |
| Deployment | AWS EC2 | HEBBS server + Next.js app as separate processes, warm gRPC connection |

---

## Success Metrics

After deploying, track:

1. **Time to first interaction** — target: < 3 seconds from page load
2. **Completion rate** — % of visitors who watch a full scenario
3. **Reflect trigger rate** — % who click the Reflect button (indicates engagement with the learning concept)
4. **"World Changed" click rate** — % who trigger the cascade (the climax moment)
5. **Code reveal toggle rate** — % who look at the agent code (indicates "I want to build this" intent)
6. **Call booking rate** — % who reach out after the experience

The north star: someone finishes the playground and their first message to you is "how do I integrate this?" — not "what does it do?"
